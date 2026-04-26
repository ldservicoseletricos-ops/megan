const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'live-autonomy-core-state.json');

function defaultState() {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: null,
    monitors: {
      uptimeMonitoringEnabled: false,
      selfHealingEnabled: false,
      autoRedeployEnabled: false,
      backupEnabled: false,
    },
    uptime: {
      provider: 'unknown',
      status: 'idle',
      lastCheckAt: null,
      failureCount: 0,
    },
    incidents: [],
    actions: [],
    lastBackup: null,
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
  return writeState(readState());
}

function setFlags(flags = {}) {
  const state = readState();
  state.monitors = {
    uptimeMonitoringEnabled: Boolean(flags.uptimeMonitoringEnabled),
    selfHealingEnabled: Boolean(flags.selfHealingEnabled),
    autoRedeployEnabled: Boolean(flags.autoRedeployEnabled),
    backupEnabled: Boolean(flags.backupEnabled),
  };
  return writeState(state);
}

function runUptimeProbe({ provider = 'render' } = {}) {
  const state = readState();
  state.uptime = {
    provider,
    status: 'checked',
    lastCheckAt: new Date().toISOString(),
    failureCount: state.uptime.failureCount || 0,
  };
  state.actions.unshift({
    id: `action-${Date.now()}`,
    type: 'uptime_probe',
    provider,
    createdAt: new Date().toISOString(),
    summary: `Sonda de uptime executada para ${provider}.`,
  });
  return writeState(state);
}

function registerIncident({ provider = 'render', summary = 'Incidente detectado' } = {}) {
  const state = readState();
  state.uptime.failureCount = (state.uptime.failureCount || 0) + 1;
  state.incidents.unshift({
    id: `incident-${Date.now()}`,
    provider,
    summary,
    createdAt: new Date().toISOString(),
    status: 'open',
  });
  return writeState(state);
}

function triggerSelfHealing({ provider = 'render' } = {}) {
  const state = readState();
  const result = {
    ok: true,
    provider,
    mode: 'self_healing',
    summary: `Tentativa de autocorreção preparada para ${provider}.`,
  };
  state.actions.unshift({
    id: `action-${Date.now()}`,
    type: 'self_healing',
    provider,
    createdAt: new Date().toISOString(),
    summary: result.summary,
  });
  writeState(state);
  return result;
}

function triggerAutoRedeploy({ provider = 'render', environment = 'preview' } = {}) {
  const state = readState();
  const result = {
    ok: true,
    provider,
    environment,
    mode: 'auto_redeploy',
    summary: `Tentativa de redeploy preparada para ${provider} em ${environment}.`,
  };
  state.actions.unshift({
    id: `action-${Date.now()}`,
    type: 'auto_redeploy',
    provider,
    environment,
    createdAt: new Date().toISOString(),
    summary: result.summary,
  });
  writeState(state);
  return result;
}

function createBackup({ target = 'backend_env' } = {}) {
  const state = readState();
  state.lastBackup = {
    id: `backup-${Date.now()}`,
    target,
    createdAt: new Date().toISOString(),
    mode: 'logical_backup',
  };
  state.actions.unshift({
    id: `action-${Date.now()}`,
    type: 'backup',
    target,
    createdAt: new Date().toISOString(),
    summary: `Backup lógico preparado para ${target}.`,
  });
  writeState(state);
  return state.lastBackup;
}

module.exports = {
  getStatus,
  setFlags,
  runUptimeProbe,
  registerIncident,
  triggerSelfHealing,
  triggerAutoRedeploy,
  createBackup,
};
