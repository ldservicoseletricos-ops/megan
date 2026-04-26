const express = require('express');
const controller = require('./app-automation.controller');
const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/run', controller.run);
router.post('/workflow', controller.workflow);
router.get('/history', controller.getHistory);
module.exports = router;
