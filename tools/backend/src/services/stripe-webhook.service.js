const path = require('path');
const { readJson, writeJson } = require('./_utils');
const modules = require('./module-access.service');
const auth = require('./auth.service');
const crm = require('./crm.service');

const checkoutsPath = path.join(__dirname, '..', 'data', 'billing-checkouts.json');

function getConfig() {
  return {
    mode: process.env.STRIPE_SECRET_KEY ? 'live_ready' : 'simulation',
    webhookReady: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  };
}

function listCheckouts() {
  return readJson(checkoutsPath, []);
}

function createCheckoutSession(payload = {}) {
  const plan = modules.getPlanById(payload.planId);
  if (!plan) throw new Error('Plano inválido.');
  const checkouts = readJson(checkoutsPath, []);
  const id = `chk_${Date.now()}`;
  const checkout = {
    id,
    userId: payload.userId,
    email: payload.email || '',
    planId: payload.planId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    checkoutUrl: `${process.env.APP_BASE_URL || 'http://localhost:5176'}/checkout?checkoutId=${id}&planId=${encodeURIComponent(payload.planId)}`,
    simulated: !process.env.STRIPE_SECRET_KEY,
  };
  checkouts.unshift(checkout);
  writeJson(checkoutsPath, checkouts);
  crm.createLead({
    name: payload.name || 'Lead',
    email: payload.email || '',
    planId: payload.planId,
    status: 'checkout_started',
    checkoutId: id,
  });
  return checkout;
}

function markPaid(checkoutId) {
  const checkouts = readJson(checkoutsPath, []);
  const idx = checkouts.findIndex((item) => item.id === checkoutId);
  if (idx === -1) throw new Error('Checkout não encontrado.');
  checkouts[idx].status = 'paid';
  checkouts[idx].paidAt = new Date().toISOString();
  writeJson(checkoutsPath, checkouts);
  const paid = checkouts[idx];
  const plan = modules.getPlanById(paid.planId);
  const user = auth.updateUserPlan(paid.userId, plan.id, plan.modules);
  crm.updateLeadStatusByCheckout(checkoutId, 'paid');
  return { checkout: paid, user };
}

function processWebhookEvent(payload = {}) {
  const checkoutId = payload.checkoutId || payload.data?.checkoutId || '';
  if (!checkoutId) throw new Error('checkoutId obrigatório no webhook.');
  return markPaid(checkoutId);
}

module.exports = { getConfig, listCheckouts, createCheckoutSession, markPaid, processWebhookEvent };
