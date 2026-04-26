function getConfig() {
  return {
    provider: 'vercel',
    deployHookConfigured: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL),
    tokenConfigured: Boolean(process.env.VERCEL_TOKEN),
    projectIdConfigured: Boolean(process.env.VERCEL_PROJECT_ID),
    teamIdConfigured: Boolean(process.env.VERCEL_TEAM_ID),
    strategy: process.env.VERCEL_DEPLOY_HOOK_URL ? 'deploy_hook' : (process.env.VERCEL_TOKEN ? 'api_or_cli' : 'not_configured'),
  };
}

function buildPlan() {
  return {
    provider: 'vercel',
    target: 'frontend',
    steps: [
      'validar build do frontend',
      'validar variáveis de ambiente do frontend',
      'usar deploy hook ou token configurado',
      'registrar status do deploy preview/production',
    ],
  };
}

function triggerDeploy({ environment = 'preview', confirmed = false } = {}) {
  if (!process.env.VERCEL_DEPLOY_HOOK_URL && !process.env.VERCEL_TOKEN) {
    return {
      ok: false,
      reason: 'Vercel não configurada: hook e token ausentes.',
    };
  }

  if (environment === 'production' && String(process.env.DEPLOY_CONFIRM_PRODUCTION || 'false') !== 'true' && !confirmed) {
    return {
      ok: false,
      reason: 'Deploy de produção bloqueado até confirmação explícita.',
    };
  }

  return {
    ok: true,
    provider: 'vercel',
    environment,
    mode: process.env.VERCEL_DEPLOY_HOOK_URL ? 'deploy_hook_ready' : 'api_ready',
    summary: 'Configuração da Vercel pronta para deploy controlado.',
  };
}

module.exports = {
  getConfig,
  buildPlan,
  triggerDeploy,
};
