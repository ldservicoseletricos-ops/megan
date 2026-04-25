
const { readJson, writeJson } = require('./store.service');
const repo = require('./repo.service');

const FILE = 'snapshots.json';

function getSnapshots() { return readJson(FILE, []); }

function createSnapshot() {
  const items = getSnapshots();
  const snapshot = {
    id: Date.now(),
    label: 'pre-promotion-snapshot',
    createdAt: new Date().toISOString()
  };
  items.unshift(snapshot);
  writeJson(FILE, items.slice(0, 160));
  repo.markSnapshot(snapshot.id);
  return snapshot;
}

module.exports = { getSnapshots, createSnapshot };
