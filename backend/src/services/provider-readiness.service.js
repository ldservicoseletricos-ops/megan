function scoreRender(env = {}) {
  const checks = {
    hasRepoRoot: Boolean(String(env.REPO_ROOT || '').trim()),
    hasFrontendUrl: Boolean(String(env.FRONTEND_URL || '').trim()),
    hasHook: Boolean(String(env.RENDER_DEPLOY_HOOK_URL || '').trim()),
  };

  const score =
    (checks.hasRepoRoot ? 35 : 0) +
    (checks.hasFrontendUrl ? 20 : 0) +
    (checks.hasHook ? 45 : 0);

  return {
    provider: 'render',
    score,
    checks,
    ready: score >= 80,
  };
}

function scoreVercel(env = {}) {
  const checks = {
    hasFrontendUrl: Boolean(String(env.FRONTEND_URL || '').trim()),
    hasHook: Boolean(String(env.VERCEL_DEPLOY_HOOK_URL || '').trim()),
    hasToken: Boolean(String(env.VERCEL_TOKEN || '').trim()),
    hasProjectId: Boolean(String(env.VERCEL_PROJECT_ID || '').trim()),
  };

  const score =
    (checks.hasFrontendUrl ? 15 : 0) +
    (checks.hasHook ? 35 : 0) +
    (checks.hasToken ? 25 : 0) +
    (checks.hasProjectId ? 25 : 0);

  return {
    provider: 'vercel',
    score,
    checks,
    ready: score >= 75,
  };
}

function buildReadiness(env = {}) {
  return {
    render: scoreRender(env),
    vercel: scoreVercel(env),
  };
}

module.exports = {
  scoreRender,
  scoreVercel,
  buildReadiness,
};
