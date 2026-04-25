function getTargetConfig(target = 'render_backend') {
  if (target === 'render_backend') {
    return {
      provider: 'render',
      hookUrl: process.env.RENDER_DEPLOY_HOOK_URL || '',
    };
  }

  if (target === 'vercel_frontend') {
    return {
      provider: 'vercel',
      hookUrl: process.env.VERCEL_DEPLOY_HOOK_URL || '',
    };
  }

  return {
    provider: 'unknown',
    hookUrl: '',
  };
}

function triggerWebhook({ target = 'render_backend', environment = 'preview', confirmed = false }) {
  const cfg = getTargetConfig(target);

  if (!cfg.hookUrl) {
    return {
      ok: false,
      provider: cfg.provider,
      target,
      environment,
      mode: 'webhook',
      executed: false,
      reason: 'Deploy hook ausente para o target selecionado.',
    };
  }

  if (environment === 'production' && !confirmed) {
    return {
      ok: false,
      provider: cfg.provider,
      target,
      environment,
      mode: 'webhook',
      executed: false,
      reason: 'Produção bloqueada até confirmação explícita.',
    };
  }

  return {
    ok: true,
    provider: cfg.provider,
    target,
    environment,
    mode: 'webhook',
    executed: true,
    summary: `Webhook pronto para ${cfg.provider} em ${environment}.`,
    hookPreview: cfg.hookUrl.slice(0, 36) + '...',
  };
}

function buildEnvironmentSplit() {
  return {
    preview: {
      allowedTargets: ['render_backend', 'vercel_frontend'],
      confirmationRequired: false,
    },
    production: {
      allowedTargets: ['render_backend', 'vercel_frontend'],
      confirmationRequired: true,
    },
  };
}

function buildRollbackPlan({ target = 'render_backend', environment = 'preview' } = {}) {
  return {
    ok: true,
    target,
    environment,
    rollback: {
      strategy: 'logical_rollback',
      steps: [
        'identificar última tentativa bem sucedida',
        'bloquear nova tentativa conflitante',
        'restaurar configuração anterior de ambiente',
        'revalidar readiness e healthcheck',
      ],
    },
  };
}

module.exports = {
  triggerWebhook,
  buildEnvironmentSplit,
  buildRollbackPlan,
};
