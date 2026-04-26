const express = require('express');
const controller = require('./business-cloud.controller');

const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/teams/create', controller.createTeam);
router.post('/crm/lead', controller.createLead);
router.post('/finance/entry', controller.addFinanceEntry);
router.post('/goals/progress', controller.updateGoalProgress);
router.post('/bi/insight', controller.generateInsight);

module.exports = router;
