const express = require('express');
const service = require('./autonomous-repair-26.service');

const router = express.Router();

router.get('/status', (_req, res) => res.json(service.diagnose()));
router.post('/diagnose', (_req, res) => res.json(service.diagnose()));
router.post('/heal', (_req, res) => res.json(service.heal()));
router.get('/logs', (_req, res) => res.json({ ok: true, logs: service.getLogs() }));
router.get('/state', (_req, res) => res.json({ ok: true, state: service.getState() }));
router.post('/rollback-plan', (_req, res) => res.json(service.rollbackPlan()));

module.exports = router;
