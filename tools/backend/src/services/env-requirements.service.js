const REQUIRED_BY_TARGET = {
  render_backend: ['REPO_ROOT', 'FRONTEND_URL'],
  vercel_frontend: ['FRONTEND_URL'],
};

function resolveRequired(target = 'render_backend') {
  return REQUIRED_BY_TARGET[target] || [];
}

function readEnvSnapshot() {
  return {
    REPO_ROOT: process.env.REPO_ROOT || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    RENDER_DEPLOY_HOOK_URL: process.env.RENDER_DEPLOY_HOOK_URL || '',
    VERCEL_DEPLOY_HOOK_URL: process.env.VERCEL_DEPLOY_HOOK_URL || '',
    VERCEL_TOKEN: process.env.VERCEL_TOKEN ? 'configured' : '',
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || '',
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID || '',
    DEPLOY_CONFIRM_PRODUCTION: process.env.DEPLOY_CONFIRM_PRODUCTION || 'false',
  };
}

function auditEnv(target = 'render_backend') {
  const env = readEnvSnapshot();
  const required = resolveRequired(target);

  const checks = required.map((key) => ({
    key,
    ok: Boolean(String(env[key] || '').trim()),
    value: key === 'VERCEL_TOKEN' ? (env[key] ? 'configured' : '') : env[key],
  }));

  const ok = checks.every((item) => item.ok);

  return {
    ok,
    target,
    checks,
    env,
  };
}

module.exports = {
  resolveRequired,
  readEnvSnapshot,
  auditEnv,
};
