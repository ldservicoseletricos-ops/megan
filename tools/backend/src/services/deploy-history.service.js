const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'deploy-history-state.json');

function defaultState() {
  return {
    version: '3.0.0',
    createdAt: new Date().toISOString(),
    productionGuardEnabled: true,
    requiresProductionConfirmation: true,
    entries: []
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
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

function listHistory() {
  return readState();
}

function addEntry(entry) {
  const state = readState();
  state.entries.unshift({
    id: `deploy-history-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  return writeState(state);
}

function getGuards() {
  const state = readState();
  return {
    productionGuardEnabled: Boolean(state.productionGuardEnabled),
    requiresProductionConfirmation: Boolean(state.requiresProductionConfirmation),
  };
}

module.exports = {
  listHistory,
  addEntry,
  getGuards,
};
