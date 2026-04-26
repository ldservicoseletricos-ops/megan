const express = require('express');
const crm = require('../services/crm.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
router.get('/leads', requireAuth, (_req, res) => res.json({ ok: true, items: crm.listLeads() }));
module.exports = router;
