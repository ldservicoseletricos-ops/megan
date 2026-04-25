const express = require('express');
const service = require('./one-click-deploy.service');

const router = express.Router();

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get('/status', (_req, res) => {
  res.json(service.publicConfigSnapshot());
});

router.post('/plan', (req, res) => {
  res.json({ ok: true, plan: service.buildPlan(req.body || {}) });
});

router.post('/run', asyncRoute(async (req, res) => {
  const result = await service.runOneClickDeploy(req.body || {});
  res.status(result.ok ? (result.needsConfirmation ? 202 : 200) : 400).json(result);
}));

module.exports = router;
