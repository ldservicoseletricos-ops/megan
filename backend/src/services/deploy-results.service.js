const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'deploy-results-state.json');

function ensureFile() {
  if (!fs.existsSync(STATE_PATH)) {
    fs.writeFileSync(STATE_PATH, JSON.stringify({
      version: '5.0.0',
      createdAt: new Date().toISOString(),
      previewResults: [],
      productionResults: [],
      lastRollbackPlan: null,
    }, null, 2), 'utf8');
  }
}

function readState() {
  ensureFile();
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

function addResult(entry) {
  const state = readState();
  const bucket = entry.environment === 'production' ? 'productionResults' : 'previewResults';
  state[bucket].unshift({
    id: `result-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  return writeState(state);
}

function setRollbackPlan(plan) {
  const state = readState();
  state.lastRollbackPlan = {
    id: `rollback-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...plan,
  };
  return writeState(state);
}

function getResults() {
  return readState();
}

module.exports = {
  addResult,
  setRollbackPlan,
  getResults,
};
