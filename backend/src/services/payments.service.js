const path = require('path');
const { readJson, writeJson } = require('./_utils');
const paymentsPath = path.join(__dirname, '..', 'data', 'payment-history.json');

function listPayments() {
  return readJson(paymentsPath, []);
}

function addPayment(payload = {}) {
  const items = readJson(paymentsPath, []);
  const payment = {
    id: `pay_${Date.now()}`,
    userId: payload.userId || '',
    email: payload.email || '',
    planId: payload.planId || '',
    amount: payload.amount || 0,
    currency: payload.currency || 'BRL',
    status: payload.status || 'paid',
    paidAt: new Date().toISOString(),
  };
  items.unshift(payment);
  writeJson(paymentsPath, items);
  return payment;
}

module.exports = { listPayments, addPayment };
