const fs = require('fs');
const path = require('path');
const connectors = require('./provider-connectors.service');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'deploy-live-connector-state.json');

function defaultState() {
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: null,
    connectors: connectors.getConnectorStatus(),
    readiness: connectors.getLiveReadiness(),
    monitors: {
      autoDeployEnabled: false,
      autoMonitorEnabled: false,
      lastProbeAt: null,
    },
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

function refresh() {
  const state = readState();
  state.connectors = connectors.getConnectorStatus();
  state.readiness = connectors.getLiveReadiness();
  state.monitors.lastProbeAt = new Date().toISOString();
  return writeState(state);
}

function addHistory(entry) {
  const state = readState();
  state.history.unshift({
    id: `live-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  return writeState(state);
}

function runProbe() {
  const state = refresh();
  return addHistory({
    type: 'probe',
    summary: 'Sonda de conectores executada.',
    readinessScore: state.readiness.score,
  });
}

function setMonitorFlags({ autoDeployEnabled = false, autoMonitorEnabled = false } = {}) {
  const state = readState();
  state.monitors.autoDeployEnabled = Boolean(autoDeployEnabled);
  state.monitors.autoMonitorEnabled = Boolean(autoMonitorEnabled);
  return writeState(state);
}

function triggerLiveAction({ target = 'render', environment = 'preview' } = {}) {
  const state = refresh();
  const connector = state.connectors[target] || { connected: false, mode: 'not_configured' };

  const result = {
    ok: Boolean(connector.connected),
    target,
    environment,
    mode: connector.mode || 'not_configured',
    summary: connector.connected
      ? `Conector ${target} pronto para ação em ${environment}.`
      : `Conector ${target} ainda não configurado.`,
  };

  addHistory({
    type: 'live_action',
    target,
    environment,
    ok: result.ok,
    summary: result.summary,
  });

  return result;
}

function getStatus() {
  return refresh();
}

module.exports = {
  getStatus,
  refresh,
  runProbe,
  setMonitorFlags,
  triggerLiveAction,
};
