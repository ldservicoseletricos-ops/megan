const express = require('express');
const auth = require('../services/auth.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    return res.json({ ok: true, ...auth.login(req.body?.email || '', req.body?.password || '') });
  } catch (error) {
    return res.status(400).json({ ok: false, reason: error.message });
  }
});

router.get('/session', requireAuth, (req, res) => res.json({ ok: true, user: req.auth.user }));
router.post('/logout', requireAuth, (req, res) => res.json({ ok: true, ...auth.logout((req.headers.authorization || '').replace(/^Bearer\s+/i, '')) }));

module.exports = router;
