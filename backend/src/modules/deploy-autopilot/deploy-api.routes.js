const express = require('express');
const service = require('./deploy-api.service');
const integrations = require('./integrations-store.service');

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

router.get('/integrations', (_req, res) => {
  res.json(integrations.listIntegrations());
});

router.get('/integrations/env-template', (_req, res) => {
  res.type('text/plain').send(integrations.exportEnvTemplate());
});

router.post('/integrations/:provider', (req, res, next) => {
  try {
    res.json(integrations.saveIntegration(req.params.provider, req.body || {}));
  } catch (error) {
    next(error);
  }
});

router.delete('/integrations/:provider', (req, res, next) => {
  try {
    res.json(integrations.deleteIntegration(req.params.provider));
  } catch (error) {
    next(error);
  }
});

router.post('/integrations/:provider/test', asyncRoute(async (req, res) => {
  res.json(await integrations.testIntegration(req.params.provider));
}));

router.get('/config', (_req, res) => {
  res.json({ ok: true, config: service.publicConfig(), plan: service.buildFullSetupPlan() });
});

router.get('/check', asyncRoute(async (_req, res) => {
  const result = await service.runConnectionCheck();
  res.json(result);
}));

router.post('/full-setup', asyncRoute(async (req, res) => {
  const result = await service.runFullSetup(req.body || {});
  res.status(result.needsConfirmation ? 202 : 200).json(result);
}));

router.get('/github/check', asyncRoute(async (_req, res) => {
  res.json({ ok: true, github: await service.checkGitHub() });
}));

router.post('/github/repo', asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, repo: await service.createGitHubRepo(req.body || {}) });
}));

router.get('/vercel/check', asyncRoute(async (_req, res) => {
  res.json({ ok: true, vercel: await service.checkVercel() });
}));

router.get('/vercel/projects', asyncRoute(async (_req, res) => {
  res.json({ ok: true, projects: await service.listVercelProjects() });
}));

router.post('/vercel/project', asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, project: await service.createVercelProject(req.body || {}) });
}));

router.post('/vercel/env', asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, env: await service.updateVercelEnv(req.body || {}) });
}));

router.get('/render/check', asyncRoute(async (_req, res) => {
  res.json({ ok: true, render: await service.checkRender() });
}));

router.get('/render/services', asyncRoute(async (_req, res) => {
  res.json({ ok: true, services: await service.listRenderServices() });
}));

router.post('/render/deploy', asyncRoute(async (req, res) => {
  res.status(201).json({ ok: true, deploy: await service.triggerRenderDeploy(req.body || {}) });
}));

router.get('/supabase/check', asyncRoute(async (_req, res) => {
  res.json({ ok: true, supabase: await service.checkSupabase() });
}));

router.get('/supabase/projects', asyncRoute(async (_req, res) => {
  res.json({ ok: true, projects: await service.listSupabaseProjects() });
}));

module.exports = router;
