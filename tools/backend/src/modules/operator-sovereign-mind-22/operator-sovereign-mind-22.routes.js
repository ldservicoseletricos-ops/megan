const express = require('express');
const service = require('./operator-sovereign-mind-22.service');
const router = express.Router();
router.get('/status', (_req, res) => res.json(service.getSovereignStatus()));
router.get('/memory', (_req, res) => res.json({ ok: true, memory: service.getStrategicMemory() }));
router.get('/tasks', (_req, res) => res.json({ ok: true, tasks: service.listTasks() }));
router.get('/decisions', (_req, res) => res.json({ ok: true, decisions: service.listDecisions() }));
router.get('/audit', (_req, res) => res.json(service.auditSystem()));
router.post('/tasks', (req, res) => {
  const { text, priority, area } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: 'Informe o texto da tarefa.' });
  res.json({ ok: true, task: service.createTask({ text, priority, area, source: 'sovereign-mind-22' }) });
});
router.post('/chat', (req, res) => {
  const { message, approval } = req.body || {};
  const result = service.handleSovereignChat(message, approval);
  res.status(result.ok ? 200 : 400).json(result);
});
module.exports = router;
