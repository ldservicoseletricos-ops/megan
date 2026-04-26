const express = require('express');
const portal = require('../services/billing-portal.service');
const modules = require('../services/module-access.service');
const subs = require('../services/subscription.service');
const crm = require('../services/crm.service');
const payments = require('../services/payments.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/portal/config', (_req, res) => res.json({ ok: true, portal: portal.getPortalConfig() }));
router.get('/payments', requireAuth, (_req, res) => res.json({ ok: true, items: payments.listPayments() }));
router.get('/subscriptions', requireAuth, (_req, res) => res.json({ ok: true, items: subs.listSubscriptions() }));

router.post('/subscription/create', requireAuth, (req, res) => {
  try {
    const plan = modules.getPlanById(req.body?.planId || '');
    if (!plan) throw new Error('Plano inválido.');
    crm.createLead({ name: req.auth.user.name, email: req.auth.user.email, planId: plan.id, status: 'active' });
    const result = subs.createSubscription({ userId: req.auth.user.id, email: req.auth.user.email, planId: plan.id });
    payments.addPayment({ userId: req.auth.user.id, email: req.auth.user.email, planId: plan.id, amount: plan.price });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.post('/subscription/cancel', requireAuth, (req, res) => {
  try {
    return res.json({ ok: true, subscription: subs.cancelSubscription(req.body?.subscriptionId || '') });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.post('/subscription/change-plan', requireAuth, (req, res) => {
  try {
    const plan = modules.getPlanById(req.body?.planId || '');
    if (!plan) throw new Error('Plano inválido.');
    const result = subs.changePlan(req.body?.subscriptionId || '', plan.id);
    payments.addPayment({ userId: result.user.id, email: result.user.email, planId: plan.id, amount: plan.price });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.post('/portal/session', requireAuth, (req, res) => {
  try {
    return res.json({ ok: true, session: portal.createPortalSession({ email: req.auth.user.email }) });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

module.exports = router;
