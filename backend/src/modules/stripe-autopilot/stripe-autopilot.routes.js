const express = require('express');
const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, module: 'stripe-autopilot', status: 'ready', mode: 'supervised' });
});

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    connected: Boolean(process.env.STRIPE_SECRET_KEY),
    missing: process.env.STRIPE_SECRET_KEY ? [] : ['STRIPE_SECRET_KEY'],
    message: process.env.STRIPE_SECRET_KEY
      ? 'Stripe configurado por variável de ambiente.'
      : 'Stripe ainda não configurado. Use o painel de integrações ou configure STRIPE_SECRET_KEY.'
  });
});

module.exports = router;
