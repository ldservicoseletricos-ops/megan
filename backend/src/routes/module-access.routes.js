const express = require('express');
const modules = require('../services/module-access.service');
const subs = require('../services/subscription.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/plans', (_req, res) => res.json({ ok: true, items: modules.listPlans() }));
router.get('/session', requireAuth, (req, res) => res.json({
  ok: true,
  user: req.auth.user,
  access: modules.getAccessFromModules(req.auth.user.modules || []),
  subscription: subs.getUserSubscription(req.auth.user.id),
}));

module.exports = router;
