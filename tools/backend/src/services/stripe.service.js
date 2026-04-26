
const path = require('path');
const crypto = require('crypto');
const { readJson, writeJson } = require('./_store');
const moduleAccess = require('./module-access.service');
const crm = require('./crm.service');
const checkoutsFile = path.join(__dirname, '..', 'data', 'billing-checkouts.json');

function listCheckouts() {
  return readJson(checkoutsFile, []);
}
function saveCheckouts(items) {
  writeJson(checkoutsFile, items);
}
function createCheckout({ email, planId, name, phone }) {
  const plan = moduleAccess.listPlans().find((p) => p.id === planId);
  if (!plan) throw new Error('Plano inválido.');
  crm.createLead({ email, name, phone, planId, source: 'checkout', status: 'checkout_started' });
  const checkouts = listCheckouts();
  const checkout = {
    id: crypto.randomUUID(),
    email,
    planId,
    status: 'pending',
    checkoutUrl: `/checkout/simulado/${planId}`,
    createdAt: new Date().toISOString(),
  };
  checkouts.unshift(checkout);
  saveCheckouts(checkouts);
  return { checkout, plan };
}
function completeCheckout(id) {
  const checkouts = listCheckouts();
  const idx = checkouts.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Checkout não encontrado.');
  checkouts[idx] = { ...checkouts[idx], status: 'paid', paidAt: new Date().toISOString() };
  saveCheckouts(checkouts);
  const user = moduleAccess.activatePlanForUser(checkouts[idx].email, checkouts[idx].planId);
  return { checkout: checkouts[idx], user };
}
module.exports = { listCheckouts, createCheckout, completeCheckout };
