const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const dataDir = path.join(__dirname, '..', '..', 'data');
const filePath = path.join(dataDir, 'persistent-core.json');

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ settings: {}, integrations: {}, state: {}, logs: [] }, null, 2));
  }
}

function readStore() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return { settings: {}, integrations: {}, state: {}, logs: [] }; }
}

function writeStore(payload) {
  ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, module: 'persistent-core', status: 'ready' });
});

router.get('/state', (_req, res) => {
  res.json({ ok: true, data: readStore() });
});

router.post('/state', (req, res) => {
  const current = readStore();
  const next = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  writeStore(next);
  res.json({ ok: true, data: next });
});

module.exports = router;
