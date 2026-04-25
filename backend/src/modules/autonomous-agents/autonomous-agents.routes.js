const express = require('express');
const controller = require('./autonomous-agents.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/agents', controller.agents);
router.get('/queue', controller.queue);
router.get('/executions', controller.executions);
router.post('/run-cycle', controller.runCycle);
router.post('/task', controller.addTask);
router.post('/agent-status', controller.updateAgentStatus);
router.post('/approve', controller.approveAction);

module.exports = router;
