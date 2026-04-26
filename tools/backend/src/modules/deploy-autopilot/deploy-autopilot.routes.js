const express = require('express');
const {
  providers,
  readState,
  envStatus,
  buildPlan,
  createRunLog,
  envTemplate,
} = require('./deploy-autopilot.service');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    module: 'Megan OS 7.0 Deploy Autopilot',
    state: readState(),
    providers: envStatus(),
    plan: buildPlan(),
  });
});

router.get('/providers', (_req, res) => {
  res.json({ ok: true, providers });
});

router.get('/plan', (_req, res) => {
  res.json({ ok: true, plan: buildPlan() });
});

router.get('/env-template', (_req, res) => {
  res.type('text/plain').send(envTemplate());
});

router.post('/run', (req, res) => {
  const action = req.body?.action || 'deploy_supervisionado';
  const entry = createRunLog(action, req.body || {});
  res.json({
    ok: true,
    entry,
    plan: buildPlan(),
    message: 'Deploy Autopilot preparado. Preencha as variáveis ausentes antes de executar integrações externas reais.',
  });
});

module.exports = router;
