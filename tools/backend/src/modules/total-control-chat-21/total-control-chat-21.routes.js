const express = require('express');
const service = require('./total-control-chat-21.service');
const router = express.Router();
router.get('/status', (_req, res) => res.json(service.getSystemStatus()));
router.get('/audit', (_req, res) => res.json(service.auditProject()));
router.get('/tasks', (_req, res) => res.json({ ok: true, tasks: service.listTasks() }));
router.post('/tasks', (req, res) => {
  const { text, priority } = req.body || {};
  if (!text) return res.status(400).json({ ok: false, error: 'Informe o texto da tarefa.' });
  res.json({ ok: true, task: service.createTask(text, priority) });
});
router.post('/chat', (req, res) => {
  const { message, approval } = req.body || {};
  const result = service.handleChat(message, approval);
  res.status(result.ok ? 200 : 400).json(result);
});
module.exports = router;
