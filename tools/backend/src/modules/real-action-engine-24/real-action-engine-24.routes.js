const express = require('express');
const service = require('./real-action-engine-24.service');
const router = express.Router();

router.get('/status', (_req, res) => res.json(service.getStatus()));
router.get('/actions', (_req, res) => res.json({ ok: true, actions: service.listAllowedActions() }));
router.get('/history', (_req, res) => res.json({ ok: true, history: service.getHistory() }));
router.get('/logs', (_req, res) => res.json(service.readLogs()));
router.get('/files', (req, res) => res.json(service.listProjectFiles(req.query?.scope)));
router.post('/chat', (req, res) => {
  const result = service.handleChat(req.body?.message, req.body?.approval);
  res.status(result.ok ? 200 : 400).json(result);
});
router.post('/execute', (req, res) => {
  const result = service.executeAction(req.body?.actionId, req.body?.approval);
  res.status(result.ok ? 200 : 400).json(result);
});

module.exports = router;
