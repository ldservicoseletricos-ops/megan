const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { URL } = require('url');

const dataDir = path.join(process.cwd(), 'data', 'deploy-autopilot');
const storePath = path.join(dataDir, 'integrations.secure.json');

const PROVIDERS = {
  github: {
    id: 'github',
    name: 'GitHub',
    purpose: 'Repositórios, push, branches, actions e versionamento.',
    tokenLabel: 'GitHub Personal Access Token',
    fields: ['token', 'owner', 'repo', 'branch'],
    required: ['token'],
    help: 'Permissões recomendadas: repo, workflow e admin:repo_hook quando precisar Actions/Webhooks.',
  },
  render: {
    id: 'render',
    name: 'Render',
    purpose: 'Backend Node.js, variáveis de ambiente, logs e deploys.',
    tokenLabel: 'Render API Key',
    fields: ['token', 'ownerId', 'serviceId', 'serviceName'],
    required: ['token'],
    help: 'Use API Key da conta Render. Service ID pode ser preenchido depois.',
  },
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    purpose: 'Frontend React/Vite, domínios, builds e variáveis.',
    tokenLabel: 'Vercel Token',
    fields: ['token', 'teamId', 'projectId', 'projectName'],
    required: ['token'],
    help: 'Team ID é opcional para conta pessoal. Project ID pode ser preenchido depois.',
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    purpose: 'PostgreSQL, project ref, anon key e conexão do banco.',
    tokenLabel: 'Supabase Access Token',
    fields: ['token', 'projectRef', 'projectUrl', 'anonKey', 'databaseUrl'],
    required: ['token'],
    help: 'Database URL fica protegida e nunca deve aparecer no frontend sem máscara.',
  },
  google: {
    id: 'google',
    name: 'Google / Gemini',
    purpose: 'Gemini, Maps, OAuth e automações Google.',
    tokenLabel: 'Gemini API Key / Google API Key',
    fields: ['token', 'geminiModel', 'mapsKey', 'oauthClientId'],
    required: ['token'],
    help: 'Use a chave Gemini para IA. Maps/OAuth podem ser adicionados depois.',
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    purpose: 'Pagamentos, assinaturas, planos e portal de cobrança.',
    tokenLabel: 'Stripe Secret Key',
    fields: ['token', 'webhookSecret', 'priceIdPro', 'priceIdEnterprise'],
    required: ['token'],
    help: 'Comece em modo teste. Nunca coloque a secret key direto no frontend.',
  },
};

function ensureDataDir() {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getSecret() {
  const base = process.env.MEGAN_SECRET_KEY || process.env.JWT_SECRET || 'megan-os-local-development-secret-change-me';
  return crypto.createHash('sha256').update(String(base)).digest();
}

function encrypt(value) {
  if (!value) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${Buffer.concat([iv, tag, encrypted]).toString('base64')}`;
}

function decrypt(value) {
  if (!value) return '';
  const text = String(value);
  if (!text.startsWith('enc:')) return text;
  const raw = Buffer.from(text.slice(4), 'base64');
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', getSecret(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

function maskValue(value) {
  if (!value) return '';
  const text = String(value);
  if (text.length <= 8) return '********';
  return `${text.slice(0, 4)}********${text.slice(-4)}`;
}

function readStore() {
  ensureDataDir();
  if (!fs.existsSync(storePath)) {
    return { version: '7.4.0', updatedAt: null, providers: {}, history: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch (_error) {
    return { version: '7.4.0', updatedAt: null, providers: {}, history: [] };
  }
}

function writeStore(store) {
  ensureDataDir();
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  return store;
}

function decryptProvider(raw = {}) {
  const decrypted = {};
  Object.entries(raw).forEach(([key, value]) => {
    decrypted[key] = key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') || key.toLowerCase().includes('url')
      ? decrypt(value)
      : value;
  });
  return decrypted;
}

function publicProvider(providerId, raw = {}) {
  const schema = PROVIDERS[providerId];
  const decrypted = decryptProvider(raw);
  const requiredComplete = schema.required.every((field) => Boolean(decrypted[field]));
  const configuredFields = schema.fields.filter((field) => Boolean(decrypted[field]));
  return {
    ...schema,
    connected: requiredComplete,
    configuredFields,
    missingFields: schema.required.filter((field) => !decrypted[field]),
    tokenPreview: maskValue(decrypted.token),
    values: Object.fromEntries(
      schema.fields
        .filter((field) => field !== 'token')
        .map((field) => [field, field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') || field.toLowerCase().includes('url') ? maskValue(decrypted[field]) : (decrypted[field] || '')])
    ),
    lastTest: raw.lastTest || null,
    updatedAt: raw.updatedAt || null,
  };
}

function listIntegrations() {
  const store = readStore();
  const providers = Object.keys(PROVIDERS).map((id) => publicProvider(id, store.providers[id] || {}));
  const connected = providers.filter((item) => item.connected).length;
  return {
    ok: true,
    version: store.version || '7.3.0',
    updatedAt: store.updatedAt,
    summary: {
      total: providers.length,
      connected,
      pending: providers.length - connected,
      percent: Math.round((connected / providers.length) * 100),
    },
    providers,
    history: (store.history || []).slice(0, 20),
  };
}

function saveIntegration(providerId, payload = {}) {
  const schema = PROVIDERS[providerId];
  if (!schema) {
    const error = new Error('Integração não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const store = readStore();
  const current = store.providers[providerId] || {};
  const next = { ...current };

  schema.fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const value = payload[field];
      const sensitive = field === 'token' || field.toLowerCase().includes('secret') || field.toLowerCase().includes('key') || field.toLowerCase().includes('url');
      if (value === '' || value === null) {
        delete next[field];
      } else {
        next[field] = sensitive ? encrypt(value) : String(value);
      }
    }
  });

  next.updatedAt = new Date().toISOString();
  store.providers[providerId] = next;
  store.updatedAt = next.updatedAt;
  store.history = [
    { id: `${providerId}-save-${Date.now()}`, provider: providerId, action: 'save', createdAt: next.updatedAt, result: 'saved' },
    ...(store.history || []),
  ].slice(0, 80);

  writeStore(store);
  return { ok: true, provider: publicProvider(providerId, next), summary: listIntegrations().summary };
}

function deleteIntegration(providerId) {
  const schema = PROVIDERS[providerId];
  if (!schema) {
    const error = new Error('Integração não encontrada.');
    error.statusCode = 404;
    throw error;
  }
  const store = readStore();
  delete store.providers[providerId];
  store.updatedAt = new Date().toISOString();
  store.history = [
    { id: `${providerId}-disconnect-${Date.now()}`, provider: providerId, action: 'disconnect', createdAt: store.updatedAt, result: 'removed' },
    ...(store.history || []),
  ].slice(0, 80);
  writeStore(store);
  return { ok: true, provider: publicProvider(providerId, {}), summary: listIntegrations().summary };
}

function requestJson({ method = 'GET', url, headers = {}, body = null, timeoutMs = 16000 }) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        port: target.port || 443,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Megan-OS-Integrations/7.3',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let data = raw;
          try { data = raw ? JSON.parse(raw) : null; } catch (_error) {}
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const error = new Error(`API retornou status ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.data = data;
            reject(error);
            return;
          }
          resolve({ statusCode: res.statusCode, data });
        });
      }
    );
    req.on('timeout', () => req.destroy(new Error('Tempo limite ao testar integração.')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function testIntegration(providerId) {
  const schema = PROVIDERS[providerId];
  if (!schema) {
    const error = new Error('Integração não encontrada.');
    error.statusCode = 404;
    throw error;
  }

  const store = readStore();
  const raw = store.providers[providerId] || {};
  const config = decryptProvider(raw);
  if (!config.token) {
    const error = new Error(`Token ausente para ${schema.name}.`);
    error.statusCode = 400;
    throw error;
  }

  let details = {};
  if (providerId === 'github') {
    const result = await requestJson({
      url: 'https://api.github.com/user',
      headers: { Authorization: `Bearer ${config.token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    });
    details = { account: result.data?.login || result.data?.name || 'GitHub conectado' };
  } else if (providerId === 'vercel') {
    const result = await requestJson({
      url: 'https://api.vercel.com/v2/user',
      headers: { Authorization: `Bearer ${config.token}` },
    });
    details = { account: result.data?.user?.username || result.data?.user?.email || 'Vercel conectado' };
  } else if (providerId === 'render') {
    const result = await requestJson({
      url: 'https://api.render.com/v1/services?limit=1',
      headers: { Authorization: `Bearer ${config.token}` },
    });
    details = { servicesVisible: Array.isArray(result.data) ? result.data.length : 0 };
  } else if (providerId === 'supabase') {
    const result = await requestJson({
      url: 'https://api.supabase.com/v1/projects',
      headers: { Authorization: `Bearer ${config.token}` },
    });
    details = { projectsVisible: Array.isArray(result.data) ? result.data.length : 0 };
  } else if (providerId === 'stripe') {
    const result = await requestJson({
      url: 'https://api.stripe.com/v1/account',
      headers: { Authorization: `Bearer ${config.token}` },
    });
    details = { account: result.data?.id || 'Stripe conectado' };
  } else if (providerId === 'google') {
    details = { account: 'Chave salva. Teste direto do Gemini/Google depende do serviço habilitado para esta chave.' };
  }

  const testedAt = new Date().toISOString();
  raw.lastTest = { ok: true, testedAt, details };
  raw.updatedAt = raw.updatedAt || testedAt;
  store.providers[providerId] = raw;
  store.updatedAt = testedAt;
  store.history = [
    { id: `${providerId}-test-${Date.now()}`, provider: providerId, action: 'test', createdAt: testedAt, result: 'success' },
    ...(store.history || []),
  ].slice(0, 80);
  writeStore(store);

  return { ok: true, provider: publicProvider(providerId, raw), details };
}

function getIntegrationConfig(providerId) {
  const schema = PROVIDERS[providerId];
  if (!schema) return null;
  const store = readStore();
  return decryptProvider(store.providers[providerId] || {});
}

function getAllIntegrationConfigs() {
  const store = readStore();
  return Object.fromEntries(Object.keys(PROVIDERS).map((id) => [id, decryptProvider(store.providers[id] || {})]));
}

function addIntegrationHistory(providerId, action, result = 'ok', extra = {}) {
  const store = readStore();
  const createdAt = new Date().toISOString();
  const entry = { id: `${providerId}-${action}-${Date.now()}`, provider: providerId, action, createdAt, result, ...extra };
  store.version = '7.4.0';
  store.updatedAt = createdAt;
  store.history = [entry, ...(store.history || [])].slice(0, 100);
  writeStore(store);
  return entry;
}

function exportEnvTemplate() {
  const store = readStore();
  const github = decryptProvider(store.providers.github || {});
  const render = decryptProvider(store.providers.render || {});
  const vercel = decryptProvider(store.providers.vercel || {});
  const supabase = decryptProvider(store.providers.supabase || {});
  const google = decryptProvider(store.providers.google || {});
  const stripe = decryptProvider(store.providers.stripe || {});

  return [
    '# Megan OS 7.3 - gerado pelo Painel de Integrações',
    `GITHUB_TOKEN=${github.token || ''}`,
    `GITHUB_OWNER=${github.owner || ''}`,
    `GITHUB_REPO=${github.repo || ''}`,
    `GIT_BRANCH=${github.branch || 'main'}`,
    `RENDER_API_KEY=${render.token || ''}`,
    `RENDER_OWNER_ID=${render.ownerId || ''}`,
    `RENDER_SERVICE_ID=${render.serviceId || ''}`,
    `RENDER_SERVICE_NAME=${render.serviceName || ''}`,
    `VERCEL_TOKEN=${vercel.token || ''}`,
    `VERCEL_ORG_ID=${vercel.teamId || ''}`,
    `VERCEL_PROJECT_ID=${vercel.projectId || ''}`,
    `VERCEL_PROJECT_NAME=${vercel.projectName || ''}`,
    `SUPABASE_ACCESS_TOKEN=${supabase.token || ''}`,
    `SUPABASE_PROJECT_REF=${supabase.projectRef || ''}`,
    `SUPABASE_URL=${supabase.projectUrl || ''}`,
    `SUPABASE_ANON_KEY=${supabase.anonKey || ''}`,
    `DATABASE_URL=${supabase.databaseUrl || ''}`,
    `GEMINI_API_KEY=${google.token || ''}`,
    `GEMINI_MODEL=${google.geminiModel || 'gemini-2.5-flash'}`,
    `GOOGLE_MAPS_API_KEY=${google.mapsKey || ''}`,
    `GOOGLE_OAUTH_CLIENT_ID=${google.oauthClientId || ''}`,
    `STRIPE_SECRET_KEY=${stripe.token || ''}`,
    `STRIPE_WEBHOOK_SECRET=${stripe.webhookSecret || ''}`,
    `STRIPE_PRICE_ID_PRO=${stripe.priceIdPro || ''}`,
    `STRIPE_PRICE_ID_ENTERPRISE=${stripe.priceIdEnterprise || ''}`,
    '',
  ].join('\n');
}

module.exports = {
  PROVIDERS,
  listIntegrations,
  saveIntegration,
  deleteIntegration,
  testIntegration,
  exportEnvTemplate,
  getIntegrationConfig,
  getAllIntegrationConfigs,
  addIntegrationHistory,
};
