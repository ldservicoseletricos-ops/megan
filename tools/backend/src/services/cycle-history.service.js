const { readJson, writeJson } = require('./store.service');

const FILE = 'cycle-history.json';
const MAX_ITEMS = 120;

function baseHistory() {
  return [];
}

function getHistory() {
  return readJson(FILE, baseHistory());
}

function saveHistory(items) {
  writeJson(FILE, items.slice(0, MAX_ITEMS));
}

function addEntry(entry) {
  const items = getHistory();
  const normalized = {
    id: `cycle_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    mode: entry.mode || 'manual',
    readiness: Number(entry.readiness || 0),
    approvedPatches: Number(entry.approvedPatches || 0),
    appliedPatches: Number(entry.appliedPatches || 0),
    totalPatches: Number(entry.totalPatches || 0),
    buildOk: Boolean(entry.buildOk),
    deployApproved: Boolean(entry.deployApproved),
    repoValid: Boolean(entry.repoValid),
    topIssue: entry.topIssue || 'optimization',
    telemetryMode: entry.telemetryMode || 'real',
    statusLine:
      entry.statusLine ||
      `readiness=${Number(entry.readiness || 0)}% | approved=${Number(entry.approvedPatches || 0)} | applied=${Number(entry.appliedPatches || 0)} | build=${Boolean(entry.buildOk)} | deploy=${Boolean(entry.deployApproved)}`,
  };

  const next = [normalized, ...items].slice(0, MAX_ITEMS);
  saveHistory(next);
  return normalized;
}

function clearHistory() {
  saveHistory([]);
  return { ok: true };
}

module.exports = { getHistory, addEntry, clearHistory };
