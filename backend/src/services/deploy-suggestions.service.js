function buildSuggestions({ readiness = {}, preflight = null } = {}) {
  const suggestions = [];

  if (readiness?.render && !readiness.render.ready) {
    suggestions.push({
      provider: 'render',
      severity: 'medium',
      message: 'Render ainda não está pronto. Preencha REPO_ROOT, FRONTEND_URL e RENDER_DEPLOY_HOOK_URL.',
    });
  }

  if (readiness?.vercel && !readiness.vercel.ready) {
    suggestions.push({
      provider: 'vercel',
      severity: 'medium',
      message: 'Vercel ainda não está pronta. Configure hook ou token, além de VERCEL_PROJECT_ID quando usar API.',
    });
  }

  const renderChecks = preflight?.checks?.render_backend?.checks || [];
  const missingRender = renderChecks.filter((item) => !item.ok).map((item) => item.key);
  if (missingRender.length) {
    suggestions.push({
      provider: 'render',
      severity: 'high',
      message: `Faltam variáveis obrigatórias para Render: ${missingRender.join(', ')}.`,
    });
  }

  const vercelChecks = preflight?.checks?.vercel_frontend?.checks || [];
  const missingVercel = vercelChecks.filter((item) => !item.ok).map((item) => item.key);
  if (missingVercel.length) {
    suggestions.push({
      provider: 'vercel',
      severity: 'high',
      message: `Faltam variáveis obrigatórias para Vercel: ${missingVercel.join(', ')}.`,
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      provider: 'global',
      severity: 'low',
      message: 'Ambiente está pronto para próximos testes controlados de deploy.',
    });
  }

  return suggestions;
}

module.exports = {
  buildSuggestions,
};
