function getConfig() {
  return {
    provider: 'render',
    deployHookConfigured: Boolean(process.env.RENDER_DEPLOY_HOOK_URL),
    deployHookUrlPreview: process.env.RENDER_DEPLOY_HOOK_URL
      ? process.env.RENDER_DEPLOY_HOOK_URL.slice(0, 32) + '...'
      : '',
    strategy: 'deploy_hook',
  };
}

function buildPlan() {
  return {
    provider: 'render',
    target: 'backend',
    steps: [
      'validar variáveis mínimas do backend',
      'validar healthcheck local em /api/health',
      'disparar deploy hook do Render',
      'registrar resultado e horário do deploy',
    ],
  };
}

function triggerDeploy({ environment = 'production', confirmed = false } = {}) {
  if (!process.env.RENDER_DEPLOY_HOOK_URL) {
    return {
      ok: false,
      reason: 'RENDER_DEPLOY_HOOK_URL ausente.',
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
    provider: 'render',
    environment,
    mode: 'deploy_hook_ready',
    hookConfigured: true,
    summary: 'Hook do Render configurado e pronto para disparo controlado.',
  };
}

module.exports = {
  getConfig,
  buildPlan,
  triggerDeploy,
};
