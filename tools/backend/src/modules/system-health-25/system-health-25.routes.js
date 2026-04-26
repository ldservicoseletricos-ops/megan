const express = require('express');
const service = require('./system-health-25.service');
const router = express.Router();

router.get('/status', (_req, res) => {
  res.json(service.getStatus());
});

module.exports = router;
