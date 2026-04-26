const path = require('path');
const { readJson, writeJson } = require('./_utils');
const modules = require('./module-access.service');
const auth = require('./auth.service');
const crm = require('./crm.service');

const subsPath = path.join(__dirname, '..', 'data', 'subscriptions.json');

function listSubscriptions() {
  return readJson(subsPath, []);
}

function getUserSubscription(userId) {
  return listSubscriptions().find((item) => item.userId === userId && item.status !== 'canceled') || null;
}

function createSubscription(payload = {}) {
  const plan = modules.getPlanById(payload.planId);
  if (!plan) throw new Error('Plano inválido.');
  const subs = readJson(subsPath, []);
  const subscription = {
    id: `sub_${Date.now()}`,
    userId: payload.userId,
    email: payload.email || '',
    planId: plan.id,
    status: 'active',
    interval: plan.interval || 'monthly',
    createdAt: new Date().toISOString(),
    renewalAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
  };
  subs.unshift(subscription);
  writeJson(subsPath, subs);
  const user = auth.updateUserPlan(payload.userId, plan.id, plan.modules);
  crm.updateLead(payload.email, { status: 'active', planId: plan.id });
  return { subscription, user };
}

function cancelSubscription(subscriptionId) {
  const subs = readJson(subsPath, []);
  const idx = subs.findIndex((item) => item.id === subscriptionId);
  if (idx === -1) throw new Error('Assinatura não encontrada.');
  subs[idx].status = 'canceled';
  subs[idx].canceledAt = new Date().toISOString();
  writeJson(subsPath, subs);
  crm.updateLead(subs[idx].email, { status: 'canceled' });
  return subs[idx];
}

function changePlan(subscriptionId, planId) {
  const plan = modules.getPlanById(planId);
  if (!plan) throw new Error('Plano inválido.');
  const subs = readJson(subsPath, []);
  const idx = subs.findIndex((item) => item.id === subscriptionId);
  if (idx === -1) throw new Error('Assinatura não encontrada.');
  subs[idx].planId = plan.id;
  subs[idx].updatedAt = new Date().toISOString();
  writeJson(subsPath, subs);
  const user = auth.updateUserPlan(subs[idx].userId, plan.id, plan.modules);
  crm.updateLead(subs[idx].email, { status: 'upgraded', planId: plan.id });
  return { subscription: subs[idx], user };
}

module.exports = { listSubscriptions, getUserSubscription, createSubscription, cancelSubscription, changePlan };
