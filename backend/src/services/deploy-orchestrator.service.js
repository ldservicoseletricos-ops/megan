const fs = require('fs');
const path = require('path');
const envRequirements = require('./env-requirements.service');
const renderProvider = require('./render-provider.service');
const vercelProvider = require('./vercel-provider.service');
const deployHistory = require('./deploy-history.service');
const providerReadiness = require('./provider-readiness.service');
const deploySuggestions = require('./deploy-suggestions.service');
const deployAttempts = require('./deploy-attempts.service');
const deployWebhookExecutor = require('./deploy-webhook-executor.service');
const deployResults = require('./deploy-results.service');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'deploy-orchestrator-state.json');


function buildEnvSnapshot() {
  return {
    REPO_ROOT: process.env.REPO_ROOT || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    RENDER_DEPLOY_HOOK_URL: process.env.RENDER_DEPLOY_HOOK_URL || '',
    VERCEL_DEPLOY_HOOK_URL: process.env.VERCEL_DEPLOY_HOOK_URL || '',
    VERCEL_TOKEN: process.env.VERCEL_TOKEN || '',
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID || '',
  };
}

function defaultState() {
  return {
    version: '1.0.0',
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: null,
    providers: {
      render: renderProvider.getConfig(),
      vercel: vercelProvider.getConfig(),
    },
    lastPreflight: null,
    lastAction: null,
    history: [],
  };
}

function ensureState() {
  if (!fs.existsSync(STATE_PATH)) {
    fs.writeFileSync(STATE_PATH, JSON.stringify(defaultState(), null, 2), 'utf8');
  }
}

function readState() {
  ensureState();
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function writeState(state) {
  state.lastUpdatedAt = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

function getStatus() {
  const state = readState();
  state.providers = {
    render: renderProvider.getConfig(),
    vercel: vercelProvider.getConfig(),
  };
  state.historyState = deployHistory.listHistory();
  state.guards = deployHistory.getGuards();
  state.readiness = providerReadiness.buildReadiness(buildEnvSnapshot());
  state.attemptLogs = deployAttempts.listAttempts();
  state.results = deployResults.getResults();
  state.environmentSplit = deployWebhookExecutor.buildEnvironmentSplit();
  state.suggestions = deploySuggestions.buildSuggestions({
    readiness: state.readiness,
    preflight: state.lastPreflight,
  });
  return writeState(state);
}

function preflight() {
  const state = readState();
  const checks = {
    render_backend: envRequirements.auditEnv('render_backend'),
    vercel_frontend: envRequirements.auditEnv('vercel_frontend'),
  };

  const summary = {
    renderReady: checks.render_backend.ok && renderProvider.getConfig().deployHookConfigured,
    vercelReady: checks.vercel_frontend.ok && (vercelProvider.getConfig().deployHookConfigured || vercelProvider.getConfig().tokenConfigured),
  };

  state.lastPreflight = {
    createdAt: new Date().toISOString(),
    checks,
    summary,
    plans: {
      render: renderProvider.buildPlan(),
      vercel: vercelProvider.buildPlan(),
    },
  };

  state.history.unshift({
    id: `preflight-${Date.now()}`,
    type: 'preflight',
    createdAt: new Date().toISOString(),
    summary,
  });

  return state.readiness = providerReadiness.buildReadiness(buildEnvSnapshot());
  state.suggestions = deploySuggestions.buildSuggestions({
    readiness: state.readiness,
    preflight: state.lastPreflight,
  });
  return writeState(state).lastPreflight;
}

function deploy({ target = 'render_backend', environment = 'preview', confirmed = false } = {}) {
  const state = readState();
  let result;

  if (target === 'render_backend') {
    result = renderProvider.triggerDeploy({ environment, confirmed });
  } else if (target === 'vercel_frontend') {
    result = vercelProvider.triggerDeploy({ environment, confirmed });
  } else {
    result = { ok: false, reason: 'Target de deploy desconhecido.' };
  }

  const webhookAttempt = deployWebhookExecutor.triggerWebhook({ target, environment, confirmed });
  result = {
    ...result,
    webhookAttempt,
  };

  state.lastAction = {
    id: `deploy-${Date.now()}`,
    target,
    environment,
    createdAt: new Date().toISOString(),
    result,
  };

  state.history.unshift({
    id: `deploy-${Date.now()}`,
    type: 'deploy',
    target,
    environment,
    createdAt: new Date().toISOString(),
    ok: Boolean(result.ok),
  });

  deployAttempts.addAttempt({
    target,
    environment,
    ok: Boolean(result.ok),
    provider: target === 'render_backend' ? 'render' : (target === 'vercel_frontend' ? 'vercel' : 'unknown'),
    mode: result.mode || 'unknown',
    summary: result.summary || result.reason || 'sem resumo',
    webhookExecuted: Boolean(result?.webhookAttempt?.executed),
  });

  deployResults.addResult({
    target,
    environment,
    ok: Boolean(result.ok),
    provider: target === 'render_backend' ? 'render' : (target === 'vercel_frontend' ? 'vercel' : 'unknown'),
    summary: result.summary || result.reason || 'sem resumo',
    webhookAttempt: result.webhookAttempt || null,
  });

  deployHistory.addEntry({
    target,
    environment,
    ok: Boolean(result.ok),
    provider: target === 'render_backend' ? 'render' : (target === 'vercel_frontend' ? 'vercel' : 'unknown'),
    summary: result.summary || result.reason || 'sem resumo',
  });

  writeState(state);
  return state.lastAction;
}

module.exports = {
  getStatus,
  preflight,
  deploy,
};

function rollback({ target = 'render_backend', environment = 'preview' } = {}) {
  const plan = deployWebhookExecutor.buildRollbackPlan({ target, environment });
  deployResults.setRollbackPlan(plan);
  return plan;
}

module.exports.rollback = rollback;
