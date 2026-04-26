const express = require('express');
const service = require('./revenue-engine-27.service');

const router = express.Router();

router.get('/status', (_req, res) => res.json(service.status()));
router.get('/dashboard', (_req, res) => res.json(service.dashboard()));
router.post('/offers/create', (req, res) => res.json(service.createOffer(req.body || {})));

module.exports = router;
