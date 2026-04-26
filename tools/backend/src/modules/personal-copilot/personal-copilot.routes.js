const express = require('express');
const controller = require('./personal-copilot.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/agenda', controller.agenda);
router.get('/metrics', controller.metrics);
router.post('/daily-focus', controller.dailyFocus);
router.post('/goal', controller.createGoal);
router.post('/health-checkin', controller.healthCheckin);
router.post('/finance', controller.addFinanceItem);
router.post('/reminder', controller.createReminder);
router.post('/decision', controller.assistDecision);
router.post('/life-cycle', controller.runLifeCycle);

module.exports = router;
