const express = require('express');
const controller = require('./global-command-center.controller');

const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/command', controller.runCommand);
router.post('/goal', controller.createGoal);
router.post('/alert/resolve', controller.resolveAlert);

module.exports = router;
