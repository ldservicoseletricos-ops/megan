const express = require('express');
const router = express.Router();

const providers = {
  github: ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'],
  render: ['RENDER_API_KEY'],
  vercel: ['VERCEL_TOKEN'],
  supabase: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
  stripe: ['STRIPE_SECRET_KEY'],
  gemini: ['GEMINI_API_KEY'],
  gmail: ['GMAIL_ACCESS_TOKEN', 'GMAIL_FROM_EMAIL'],
  whatsapp: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
  telegram: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']
};

function statusFor(provider) {
  const required = providers[provider] || [];
  const missing = required.filter((key) => !process.env[key]);
  return { provider, connected: missing.length === 0, missing, score: required.length ? Math.round(((required.length - missing.length) / required.length) * 100) : 0 };
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, module: 'integrations', status: 'ready' });
});

router.get('/status', (_req, res) => {
  const data = Object.keys(providers).map(statusFor);
  res.json({ ok: true, data });
});

router.get('/status/:provider', (req, res) => {
  res.json({ ok: true, data: statusFor(req.params.provider) });
});

module.exports = router;
