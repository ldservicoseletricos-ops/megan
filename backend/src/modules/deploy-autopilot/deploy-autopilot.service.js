const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'deploy-autopilot-state.json');

const providers = [
  {
    id: 'github',
    name: 'GitHub',
    purpose: 'Repositório, commits, push e versionamento.',
    requiredEnv: ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'],
    optionalEnv: ['GIT_BRANCH'],
    safeActions: ['validar token', 'validar repositório', 'preparar commit', 'gerar checklist de push'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    purpose: 'Deploy automático do frontend React/Vite.',
    requiredEnv: ['VERCEL_TOKEN', 'VERCEL_PROJECT_NAME'],
    optionalEnv: ['VERCEL_ORG_ID', 'VERCEL_PROJECT_ID', 'FRONTEND_URL'],
    safeActions: ['validar token', 'criar projeto frontend', 'sincronizar variáveis', 'iniciar deploy'],
  },
  {
    id: 'render',
    name: 'Render',
    purpose: 'Deploy automático do backend Node.js.',
    requiredEnv: ['RENDER_API_KEY', 'RENDER_SERVICE_NAME'],
    optionalEnv: ['RENDER_SERVICE_ID', 'RENDER_OWNER_ID', 'BACKEND_URL'],
    safeActions: ['validar token', 'criar serviço backend', 'sincronizar variáveis', 'iniciar deploy'],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    purpose: 'Banco PostgreSQL, migrations e variáveis de conexão.',
    requiredEnv: ['SUPABASE_ACCESS_TOKEN', 'SUPABASE_PROJECT_REF', 'DATABASE_URL'],
    optionalEnv: ['SUPABASE_DB_PASSWORD', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    safeActions: ['validar projeto', 'testar DATABASE_URL', 'preparar SQL', 'executar migrations assistidas'],
  },
  {
    id: 'google',
    name: 'Google Cloud / Gemini',
    purpose: 'IA, mapas, OAuth e serviços Google.',
    requiredEnv: ['GEMINI_API_KEY'],
    optionalEnv: ['GOOGLE_MAPS_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    safeActions: ['validar chaves', 'checar variáveis', 'gerar checklist de APIs'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    purpose: 'Pagamentos, planos e portal de cobrança.',
    requiredEnv: ['STRIPE_SECRET_KEY'],
    optionalEnv: ['STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_ID_PRO', 'STRIPE_PRICE_ID_ENTERPRISE'],
    safeActions: ['validar modo teste', 'checar preços', 'preparar webhook'],
  },
];

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) {
    return {
      version: '7.0.0',
      mode: 'supervised',
      status: 'ready',
      lastRun: null,
      history: [],
    };
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (_error) {
    return {
      version: '7.0.0',
      mode: 'safe-recovery',
      status: 'state_recreated',
      lastRun: null,
      history: [],
    };
  }
}

function writeState(state) {
  ensureDataDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function maskValue(value) {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}********${value.slice(-4)}`;
}

function envStatus() {
  return providers.map((provider) => {
    const required = provider.requiredEnv.map((key) => ({
      key,
      present: Boolean(process.env[key]),
      preview: maskValue(process.env[key] || ''),
    }));

    const optional = provider.optionalEnv.map((key) => ({
      key,
      present: Boolean(process.env[key]),
      preview: maskValue(process.env[key] || ''),
    }));

    const missing = required.filter((item) => !item.present).map((item) => item.key);
    const complete = missing.length === 0;

    return {
      ...provider,
      complete,
      missing,
      required,
      optional,
      status: complete ? 'ready' : 'needs_env',
    };
  });
}

function buildPlan() {
  const status = envStatus();
  const ready = status.filter((item) => item.complete).map((item) => item.id);
  const blocked = status.filter((item) => !item.complete).map((item) => ({ provider: item.id, missing: item.missing }));

  return {
    mode: 'supervised_autopilot',
    safety: 'A Megan prepara, valida e executa apenas quando as chaves necessárias existem no .env.',
    order: [
      '1. Validar estrutura local do projeto.',
      '2. Validar GitHub e branch principal.',
      '3. Validar Supabase e DATABASE_URL.',
      '4. Sincronizar backend no Render.',
      '5. Sincronizar frontend na Vercel.',
      '6. Sincronizar variáveis entre backend e frontend.',
      '7. Executar health check público.',
      '8. Registrar histórico e próxima ação.',
    ],
    ready,
    blocked,
    nextAction: blocked.length
      ? `Adicionar variáveis ausentes: ${blocked.flatMap((item) => item.missing).join(', ')}`
      : 'Executar deploy supervisionado completo.',
  };
}

function createRunLog(action, payload = {}) {
  const state = readState();
  const entry = {
    id: `deploy-${Date.now()}`,
    action,
    payload,
    createdAt: new Date().toISOString(),
    result: 'planned',
    note: 'Execução protegida: este endpoint registra o plano e evita alterações externas sem tokens e confirmação operacional.',
  };

  state.lastRun = entry;
  state.history = [entry, ...(state.history || [])].slice(0, 30);
  state.status = 'planned';
  writeState(state);
  return entry;
}

function envTemplate() {
  return [
    '# MEGAN OS 7.0 DEPLOY AUTOPILOT',
    '# Copie para backend/.env e preencha somente no seu computador/Render/Vercel.',
    '',
    'GITHUB_TOKEN=',
    'GITHUB_OWNER=',
    'GITHUB_REPO=',
    'GIT_BRANCH=main',
    '',
    'VERCEL_TOKEN=',
    'VERCEL_ORG_ID=',
    'VERCEL_PROJECT_ID=',
    'VERCEL_PROJECT_NAME=megan-os-frontend',
    'FRONTEND_URL=',
    '',
    'RENDER_API_KEY=',
    'RENDER_OWNER_ID=',
    'RENDER_SERVICE_ID=',
    'RENDER_SERVICE_NAME=megan-os-backend',
    'BACKEND_URL=',
    '',
    'SUPABASE_ACCESS_TOKEN=',
    'SUPABASE_PROJECT_REF=',
    'SUPABASE_DB_PASSWORD=',
    'DATABASE_URL=',
    'SUPABASE_ANON_KEY=',
    'SUPABASE_SERVICE_ROLE_KEY=',
    '',
    'GEMINI_API_KEY=',
    'GOOGLE_MAPS_API_KEY=',
    'GOOGLE_CLIENT_ID=',
    'GOOGLE_CLIENT_SECRET=',
    '',
    'STRIPE_SECRET_KEY=',
    'STRIPE_WEBHOOK_SECRET=',
    'STRIPE_PRICE_ID_PRO=',
    'STRIPE_PRICE_ID_ENTERPRISE=',
  ].join('\n');
}

module.exports = {
  providers,
  readState,
  writeState,
  envStatus,
  buildPlan,
  createRunLog,
  envTemplate,
};
