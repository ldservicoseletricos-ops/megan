const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '..', '..', 'data', 'deploy-attempt-logs.json');

function ensureFile() {
  if (!fs.existsSync(STATE_PATH)) {
    fs.writeFileSync(STATE_PATH, JSON.stringify({
      version: '4.0.0',
      createdAt: new Date().toISOString(),
      entries: [],
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

function listAttempts() {
  return readState();
}

function addAttempt(entry) {
  const state = readState();
  state.entries.unshift({
    id: `attempt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...entry,
  });
  return writeState(state);
}

module.exports = {
  listAttempts,
  addAttempt,
};
