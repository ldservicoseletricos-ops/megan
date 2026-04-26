const modules = require('./module-access.service');
const subscriptions = require('./subscription.service');

function getConfig() {
  return {
    mode: process.env.STRIPE_SECRET_KEY ? 'live_ready' : 'simulation',
    webhookReady: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  };
}

function createSubscriptionCheckout(payload = {}) {
  const plan = modules.getPlanById(payload.planId);
  if (!plan) throw new Error('Plano inválido.');
  const subscription = subscriptions.createSubscription(payload);
  return {
    subscription,
    checkoutUrl: `${process.env.APP_BASE_URL || 'http://localhost:5176'}/checkout?subscriptionId=${subscription.id}&planId=${encodeURIComponent(plan.id)}`,
  };
}

module.exports = { getConfig, createSubscriptionCheckout };
