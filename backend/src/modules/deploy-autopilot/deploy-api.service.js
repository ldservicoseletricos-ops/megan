const https = require('https');
const { URL } = require('url');
const {
  readState,
  writeState,
  envStatus,
  buildPlan,
} = require('./deploy-autopilot.service');

function maskValue(value) {
  if (!value) return '';
  const text = String(value);
  if (text.length <= 10) return '**********';
  return `${text.slice(0, 5)}********${text.slice(-5)}`;
}

function now() {
  return new Date().toISOString();
}

function getEnv(key, fallback = '') {
  return process.env[key] || fallback;
}

function requireEnv(keys) {
  const missing = keys.filter((key) => !getEnv(key));
  if (missing.length) {
    const error = new Error(`Variáveis ausentes: ${missing.join(', ')}`);
    error.statusCode = 400;
    error.missing = missing;
    throw error;
  }
}

function requestJson({ method = 'GET', url, headers = {}, body = null, timeoutMs = 20000 }) {
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
          'User-Agent': 'Megan-OS-Deploy-Autopilot/7.1',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
        timeout: timeoutMs,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let data = raw;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch (_error) {
            data = raw;
          }

          const result = {
            ok: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            data,
          };

          if (!result.ok) {
            const error = new Error(`API retornou status ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.response = result;
            reject(error);
            return;
          }

          resolve(result);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Tempo limite ao chamar API externa.'));
    });

    req.on('error', reject);

    if (payload) req.write(payload);
    req.end();
  });
}

function saveApiLog(provider, action, result, extra = {}) {
  const state = readState();
  const entry = {
    id: `${provider}-${action}-${Date.now()}`,
    provider,
    action,
    createdAt: now(),
    result,
    ...extra,
  };

  state.lastRun = entry;
  state.history = [entry, ...(state.history || [])].slice(0, 80);
  state.status = result;
  writeState(state);
  return entry;
}

function publicConfig() {
  return {
    github: {
      owner: getEnv('GITHUB_OWNER'),
      repo: getEnv('GITHUB_REPO'),
      branch: getEnv('GIT_BRANCH', 'main'),
      tokenPreview: maskValue(getEnv('GITHUB_TOKEN')),
    },
    render: {
      ownerId: getEnv('RENDER_OWNER_ID'),
      serviceId: getEnv('RENDER_SERVICE_ID'),
      serviceName: getEnv('RENDER_SERVICE_NAME', 'megan-os-backend'),
      tokenPreview: maskValue(getEnv('RENDER_API_KEY')),
    },
    vercel: {
      orgId: getEnv('VERCEL_ORG_ID'),
      projectId: getEnv('VERCEL_PROJECT_ID'),
      projectName: getEnv('VERCEL_PROJECT_NAME', 'megan-os-frontend'),
      tokenPreview: maskValue(getEnv('VERCEL_TOKEN')),
    },
    supabase: {
      projectRef: getEnv('SUPABASE_PROJECT_REF'),
      databaseUrlPreview: maskValue(getEnv('DATABASE_URL')),
      tokenPreview: maskValue(getEnv('SUPABASE_ACCESS_TOKEN')),
    },
  };
}

async function checkGitHub() {
  requireEnv(['GITHUB_TOKEN']);
  const token = getEnv('GITHUB_TOKEN');
  const user = await requestJson({
    url: 'https://api.github.com/user',
    headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
  });

  let repo = null;
  if (getEnv('GITHUB_OWNER') && getEnv('GITHUB_REPO')) {
    repo = await requestJson({
      url: `https://api.github.com/repos/${getEnv('GITHUB_OWNER')}/${getEnv('GITHUB_REPO')}`,
      headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    });
  }

  saveApiLog('github', 'check', 'success');
  return {
    user: user.data?.login || user.data?.name || 'GitHub conectado',
    repo: repo?.data ? { fullName: repo.data.full_name, private: repo.data.private, defaultBranch: repo.data.default_branch } : null,
  };
}

async function createGitHubRepo({ name, privateRepo = true, description = 'Megan OS repository created by Deploy Autopilot' }) {
  requireEnv(['GITHUB_TOKEN']);
  const token = getEnv('GITHUB_TOKEN');
  const repoName = name || getEnv('GITHUB_REPO') || 'megan-os';
  const result = await requestJson({
    method: 'POST',
    url: 'https://api.github.com/user/repos',
    headers: { Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    body: {
      name: repoName,
      private: Boolean(privateRepo),
      description,
      auto_init: false,
    },
  });
  saveApiLog('github', 'create_repo', 'success', { repo: result.data?.full_name });
  return { fullName: result.data?.full_name, cloneUrl: result.data?.clone_url, htmlUrl: result.data?.html_url };
}

async function checkVercel() {
  requireEnv(['VERCEL_TOKEN']);
  const token = getEnv('VERCEL_TOKEN');
  const result = await requestJson({
    url: 'https://api.vercel.com/v2/user',
    headers: { Authorization: `Bearer ${token}` },
  });
  saveApiLog('vercel', 'check', 'success');
  return { user: result.data?.user?.username || result.data?.user?.email || 'Vercel conectado' };
}

async function listVercelProjects() {
  requireEnv(['VERCEL_TOKEN']);
  const token = getEnv('VERCEL_TOKEN');
  const teamQuery = getEnv('VERCEL_ORG_ID') ? `?teamId=${encodeURIComponent(getEnv('VERCEL_ORG_ID'))}` : '';
  const result = await requestJson({
    url: `https://api.vercel.com/v9/projects${teamQuery}`,
    headers: { Authorization: `Bearer ${token}` },
  });
  saveApiLog('vercel', 'list_projects', 'success');
  return (result.data?.projects || []).map((project) => ({ id: project.id, name: project.name, framework: project.framework }));
}

async function createVercelProject({ name, framework = 'vite', rootDirectory = 'frontend' }) {
  requireEnv(['VERCEL_TOKEN']);
  const token = getEnv('VERCEL_TOKEN');
  const teamQuery = getEnv('VERCEL_ORG_ID') ? `?teamId=${encodeURIComponent(getEnv('VERCEL_ORG_ID'))}` : '';
  const result = await requestJson({
    method: 'POST',
    url: `https://api.vercel.com/v10/projects${teamQuery}`,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      name: name || getEnv('VERCEL_PROJECT_NAME') || 'megan-os-frontend',
      framework,
      rootDirectory,
    },
  });
  saveApiLog('vercel', 'create_project', 'success', { projectId: result.data?.id });
  return { id: result.data?.id, name: result.data?.name, framework: result.data?.framework };
}

async function checkRender() {
  requireEnv(['RENDER_API_KEY']);
  const result = await requestJson({
    url: 'https://api.render.com/v1/services?limit=20',
    headers: { Authorization: `Bearer ${getEnv('RENDER_API_KEY')}` },
  });
  saveApiLog('render', 'check', 'success');
  return { services: Array.isArray(result.data) ? result.data.length : 0 };
}

async function listRenderServices() {
  requireEnv(['RENDER_API_KEY']);
  const result = await requestJson({
    url: 'https://api.render.com/v1/services?limit=100',
    headers: { Authorization: `Bearer ${getEnv('RENDER_API_KEY')}` },
  });
  saveApiLog('render', 'list_services', 'success');
  return (result.data || []).map((item) => {
    const service = item.service || item;
    return { id: service.id, name: service.name, type: service.type, serviceDetails: service.serviceDetails?.env || service.env };
  });
}

async function triggerRenderDeploy({ serviceId }) {
  const targetServiceId = serviceId || getEnv('RENDER_SERVICE_ID');
  requireEnv(['RENDER_API_KEY']);
  if (!targetServiceId) {
    const error = new Error('RENDER_SERVICE_ID ausente. Liste os serviços ou preencha a variável antes.');
    error.statusCode = 400;
    throw error;
  }
  const result = await requestJson({
    method: 'POST',
    url: `https://api.render.com/v1/services/${targetServiceId}/deploys`,
    headers: { Authorization: `Bearer ${getEnv('RENDER_API_KEY')}` },
    body: { clearCache: 'do_not_clear' },
  });
  saveApiLog('render', 'trigger_deploy', 'success', { serviceId: targetServiceId });
  return { id: result.data?.id, status: result.data?.status, serviceId: targetServiceId };
}

async function checkSupabase() {
  requireEnv(['SUPABASE_ACCESS_TOKEN']);
  const result = await requestJson({
    url: 'https://api.supabase.com/v1/projects',
    headers: { Authorization: `Bearer ${getEnv('SUPABASE_ACCESS_TOKEN')}` },
  });
  saveApiLog('supabase', 'check', 'success');
  return { projects: Array.isArray(result.data) ? result.data.length : 0 };
}

async function listSupabaseProjects() {
  requireEnv(['SUPABASE_ACCESS_TOKEN']);
  const result = await requestJson({
    url: 'https://api.supabase.com/v1/projects',
    headers: { Authorization: `Bearer ${getEnv('SUPABASE_ACCESS_TOKEN')}` },
  });
  saveApiLog('supabase', 'list_projects', 'success');
  return (result.data || []).map((project) => ({ id: project.id, name: project.name, region: project.region, status: project.status }));
}

async function updateVercelEnv({ key, value, target = ['production', 'preview', 'development'], projectId }) {
  requireEnv(['VERCEL_TOKEN']);
  const token = getEnv('VERCEL_TOKEN');
  const targetProject = projectId || getEnv('VERCEL_PROJECT_ID') || getEnv('VERCEL_PROJECT_NAME');
  if (!targetProject) {
    const error = new Error('VERCEL_PROJECT_ID ou VERCEL_PROJECT_NAME ausente.');
    error.statusCode = 400;
    throw error;
  }
  if (!key || typeof value === 'undefined') {
    const error = new Error('Informe key e value para criar variável na Vercel.');
    error.statusCode = 400;
    throw error;
  }
  const teamQuery = getEnv('VERCEL_ORG_ID') ? `?teamId=${encodeURIComponent(getEnv('VERCEL_ORG_ID'))}` : '';
  const result = await requestJson({
    method: 'POST',
    url: `https://api.vercel.com/v10/projects/${encodeURIComponent(targetProject)}/env${teamQuery}`,
    headers: { Authorization: `Bearer ${token}` },
    body: {
      key,
      value: String(value),
      type: 'encrypted',
      target,
    },
  });
  saveApiLog('vercel', 'update_env', 'success', { key, projectId: targetProject });
  return { id: result.data?.id, key, target };
}

async function runConnectionCheck() {
  const checks = [];
  const providers = envStatus();

  async function pushCheck(id, fn) {
    try {
      const data = await fn();
      checks.push({ id, ok: true, data });
    } catch (error) {
      checks.push({
        id,
        ok: false,
        statusCode: error.statusCode || error.response?.statusCode || 500,
        message: error.message,
        missing: error.missing || [],
      });
    }
  }

  await pushCheck('github', checkGitHub);
  await pushCheck('vercel', checkVercel);
  await pushCheck('render', checkRender);
  await pushCheck('supabase', checkSupabase);

  saveApiLog('all', 'connection_check', checks.every((item) => item.ok) ? 'success' : 'partial', { checks });

  return {
    ok: checks.every((item) => item.ok),
    checks,
    env: providers,
    plan: buildPlan(),
    config: publicConfig(),
  };
}

function buildFullSetupPlan() {
  return {
    name: 'Megan OS 7.1 API Deploy Autopilot',
    mode: 'supervisionado_por_api',
    steps: [
      { id: 'github_check', label: 'Validar token GitHub e repositório' },
      { id: 'supabase_check', label: 'Validar token Supabase e projeto' },
      { id: 'render_check', label: 'Validar token Render e serviço backend' },
      { id: 'vercel_check', label: 'Validar token Vercel e projeto frontend' },
      { id: 'env_sync', label: 'Sincronizar variáveis necessárias' },
      { id: 'deploy_backend', label: 'Disparar deploy backend no Render' },
      { id: 'deploy_frontend', label: 'Preparar deploy frontend na Vercel' },
      { id: 'health_check', label: 'Validar URLs públicas' },
    ],
    safety: [
      'Nenhuma chave secreta é exibida em resposta.',
      'Criação/alteração externa deve ser chamada por endpoint específico.',
      'Endpoint de execução completa exige confirm=true.',
      'Falhas ficam registradas no histórico local.',
    ],
  };
}

async function runFullSetup({ confirm = false, triggerDeploy = false } = {}) {
  if (!confirm) {
    return {
      ok: false,
      needsConfirmation: true,
      plan: buildFullSetupPlan(),
      message: 'Para executar chamadas reais, envie confirm=true. Sem confirmação, a Megan apenas mostra o plano.',
    };
  }

  const connection = await runConnectionCheck();
  const actions = [];

  if (triggerDeploy) {
    try {
      const deploy = await triggerRenderDeploy({});
      actions.push({ id: 'render_deploy', ok: true, deploy });
    } catch (error) {
      actions.push({ id: 'render_deploy', ok: false, message: error.message });
    }
  }

  saveApiLog('all', 'full_setup', connection.ok ? 'success' : 'partial', { triggerDeploy });

  return {
    ok: connection.ok,
    connection,
    actions,
    nextAction: connection.ok
      ? 'APIs conectadas. Próximo passo: sincronizar variáveis e disparar deploy supervisionado.'
      : 'Corrija as variáveis ausentes ou tokens inválidos e rode novamente.',
  };
}

module.exports = {
  publicConfig,
  buildFullSetupPlan,
  runConnectionCheck,
  runFullSetup,
  checkGitHub,
  createGitHubRepo,
  checkVercel,
  listVercelProjects,
  createVercelProject,
  updateVercelEnv,
  checkRender,
  listRenderServices,
  triggerRenderDeploy,
  checkSupabase,
  listSupabaseProjects,
};
