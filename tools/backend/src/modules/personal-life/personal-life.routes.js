const express = require('express');
const controller = require('./personal-life.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.post('/routine/task', controller.addRoutineTask);
router.post('/goals/progress', controller.updateGoalProgress);
router.post('/health/checkin', controller.addHealthCheckin);
router.post('/money/entry', controller.addMoneyEntry);
router.post('/focus/session', controller.addFocusSession);
router.post('/productivity/action', controller.addProductivityAction);

module.exports = router;
