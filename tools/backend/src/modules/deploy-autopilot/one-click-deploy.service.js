const integrations = require('./integrations-store.service');

const REQUIRED_FOR_ONE_CLICK = ['github', 'render', 'vercel', 'supabase'];
const OPTIONAL_FOR_ONE_CLICK = ['google', 'stripe'];

function normalizeProjectName(value = 'megan-os-app') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'megan-os-app';
}

function publicConfigSnapshot() {
  const list = integrations.listIntegrations();
  const providers = list.providers.map((provider) => ({
    id: provider.id,
    name: provider.name,
    connected: provider.connected,
    missingFields: provider.missingFields || [],
    configuredFields: provider.configuredFields || [],
    required: provider.required || [],
  }));

  const required = providers.filter((provider) => REQUIRED_FOR_ONE_CLICK.includes(provider.id));
  const optional = providers.filter((provider) => OPTIONAL_FOR_ONE_CLICK.includes(provider.id));
  const missingRequired = required.filter((provider) => !provider.connected);

  return {
    ok: true,
    mode: 'supervisionado',
    version: '7.4.0',
    ready: missingRequired.length === 0,
    summary: {
      total: providers.length,
      connected: providers.filter((provider) => provider.connected).length,
      required: required.length,
      requiredConnected: required.filter((provider) => provider.connected).length,
      optionalConnected: optional.filter((provider) => provider.connected).length,
    },
    required,
    optional,
    missingRequired: missingRequired.map((provider) => provider.id),
    nextAction: missingRequired.length
      ? 'Conecte as integrações obrigatórias antes de executar o deploy 1 clique.'
      : 'Tudo pronto para validar e publicar com supervisão.',
  };
}

function buildPlan(input = {}) {
  const projectName = normalizeProjectName(input.projectName || input.name || 'megan-os-app');
  const backendName = normalizeProjectName(input.backendName || `${projectName}-backend`);
  const frontendName = normalizeProjectName(input.frontendName || `${projectName}-frontend`);
  const repoName = normalizeProjectName(input.repoName || projectName);
  const branch = input.branch || 'main';

  return {
    projectName,
    repoName,
    branch,
    backendName,
    frontendName,
    databaseName: normalizeProjectName(input.databaseName || `${projectName}-db`),
    steps: [
      { id: 'preflight', title: 'Validar conexões', provider: 'all', safe: true },
      { id: 'github_repo', title: 'Criar ou validar repositório GitHub', provider: 'github', safe: false },
      { id: 'supabase_project', title: 'Preparar projeto Supabase e variáveis do banco', provider: 'supabase', safe: false },
      { id: 'render_backend', title: 'Preparar backend no Render', provider: 'render', safe: false },
      { id: 'vercel_frontend', title: 'Preparar frontend na Vercel', provider: 'vercel', safe: false },
      { id: 'env_sync', title: 'Sincronizar variáveis entre backend e frontend', provider: 'all', safe: false },
      { id: 'deploy', title: 'Disparar deploy supervisionado', provider: 'render/vercel', safe: false },
      { id: 'healthcheck', title: 'Validar URLs finais', provider: 'all', safe: true },
    ],
  };
}

async function testRequiredProviders() {
  const results = [];
  for (const providerId of REQUIRED_FOR_ONE_CLICK) {
    try {
      const result = await integrations.testIntegration(providerId);
      results.push({ provider: providerId, ok: true, details: result.details || {} });
    } catch (error) {
      results.push({ provider: providerId, ok: false, message: error.message, statusCode: error.statusCode || 500 });
    }
  }
  return results;
}

async function saveTokensFromPayload(tokens = {}) {
  const saved = [];
  for (const providerId of Object.keys(tokens || {})) {
    if (!tokens[providerId] || typeof tokens[providerId] !== 'object') continue;
    const result = integrations.saveIntegration(providerId, tokens[providerId]);
    saved.push({ provider: providerId, ok: true, connected: result.provider?.connected });
  }
  return saved;
}

function buildLinks(plan, configs) {
  const githubOwner = configs.github?.owner || 'seu-usuario';
  const repoName = configs.github?.repo || plan.repoName;
  const renderName = configs.render?.serviceName || plan.backendName;
  const vercelName = configs.vercel?.projectName || plan.frontendName;
  const supabaseRef = configs.supabase?.projectRef || 'project-ref';

  return {
    github: `https://github.com/${githubOwner}/${repoName}`,
    backend: `https://${renderName}.onrender.com`,
    frontend: `https://${vercelName}.vercel.app`,
    supabase: configs.supabase?.projectUrl || `https://${supabaseRef}.supabase.co`,
  };
}

async function runOneClickDeploy(payload = {}) {
  const saved = await saveTokensFromPayload(payload.tokens || {});
  const plan = buildPlan(payload);
  const snapshot = publicConfigSnapshot();

  if (!snapshot.ready) {
    integrations.addIntegrationHistory('one-click', 'blocked_missing_integrations', 'blocked', { missingRequired: snapshot.missingRequired });
    return {
      ok: false,
      needsConfiguration: true,
      saved,
      snapshot,
      plan,
      reason: `Faltam integrações obrigatórias: ${snapshot.missingRequired.join(', ')}`,
    };
  }

  const preflight = await testRequiredProviders();
  const preflightOk = preflight.every((item) => item.ok);

  if (!preflightOk) {
    integrations.addIntegrationHistory('one-click', 'blocked_preflight_failed', 'blocked', { preflight });
    return {
      ok: false,
      needsFix: true,
      saved,
      snapshot: publicConfigSnapshot(),
      plan,
      preflight,
      reason: 'Uma ou mais conexões falharam no teste. Corrija o token antes de publicar.',
    };
  }

  if (!payload.confirm) {
    integrations.addIntegrationHistory('one-click', 'ready_waiting_confirmation', 'ready', { projectName: plan.projectName });
    return {
      ok: true,
      needsConfirmation: true,
      dryRun: true,
      saved,
      snapshot: publicConfigSnapshot(),
      plan,
      preflight,
      message: 'Validação aprovada. Clique em Publicar agora para executar a publicação supervisionada.',
    };
  }

  const configs = integrations.getAllIntegrationConfigs();
  const links = buildLinks(plan, configs);
  const actions = plan.steps.map((step, index) => ({
    ...step,
    order: index + 1,
    status: step.safe ? 'validated' : 'prepared',
    note: step.safe
      ? 'Etapa validada com segurança.'
      : 'Etapa preparada. Integração real pode exigir IDs finais, permissões e confirmação da plataforma.',
  }));

  integrations.addIntegrationHistory('one-click', 'deploy_prepared', 'success', { projectName: plan.projectName, links });

  return {
    ok: true,
    executed: true,
    supervised: true,
    snapshot: publicConfigSnapshot(),
    plan,
    preflight,
    actions,
    links,
    message: 'Deploy 1 clique preparado com sucesso. Confira os links e finalize qualquer aprovação exigida pelas plataformas.',
  };
}

module.exports = {
  publicConfigSnapshot,
  buildPlan,
  runOneClickDeploy,
};
