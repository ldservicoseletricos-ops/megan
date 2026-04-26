function mask(value = '') {
  const text = String(value || '').trim();
  if (!text) return '';
  if (text.length <= 8) return 'configured';
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

function getConnectorStatus() {
  return {
    render: {
      connected: Boolean(process.env.RENDER_DEPLOY_HOOK_URL),
      mode: process.env.RENDER_DEPLOY_HOOK_URL ? 'deploy_hook' : 'not_configured',
      hookPreview: mask(process.env.RENDER_DEPLOY_HOOK_URL || ''),
    },
    vercel: {
      connected: Boolean(process.env.VERCEL_DEPLOY_HOOK_URL || process.env.VERCEL_TOKEN),
      mode: process.env.VERCEL_DEPLOY_HOOK_URL ? 'deploy_hook' : (process.env.VERCEL_TOKEN ? 'api' : 'not_configured'),
      hookPreview: mask(process.env.VERCEL_DEPLOY_HOOK_URL || ''),
      tokenConfigured: Boolean(process.env.VERCEL_TOKEN),
      projectIdConfigured: Boolean(process.env.VERCEL_PROJECT_ID),
      teamIdConfigured: Boolean(process.env.VERCEL_TEAM_ID),
    },
    github: {
      connected: Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_REPO),
      repo: process.env.GITHUB_REPO || '',
      tokenConfigured: Boolean(process.env.GITHUB_TOKEN),
    },
    supabase: {
      connected: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      urlConfigured: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
  };
}

function getLiveReadiness() {
  const status = getConnectorStatus();
  const checks = {
    render: status.render.connected,
    vercel: status.vercel.connected,
    github: status.github.connected,
    supabase: status.supabase.connected,
  };
  const score =
    (checks.render ? 25 : 0) +
    (checks.vercel ? 25 : 0) +
    (checks.github ? 25 : 0) +
    (checks.supabase ? 25 : 0);

  return {
    score,
    checks,
    ready: score >= 75,
  };
}

module.exports = {
  getConnectorStatus,
  getLiveReadiness,
};
