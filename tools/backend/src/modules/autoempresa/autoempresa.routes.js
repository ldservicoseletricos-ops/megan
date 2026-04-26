const express = require('express');
const controller = require('./autoempresa.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.post('/lead', controller.captureLead);
router.post('/reply', controller.replyCustomer);
router.post('/proposal', controller.createProposal);
router.post('/follow-up', controller.createFollowUp);
router.post('/billing', controller.createBillingAction);
router.get('/metrics', controller.metrics);
router.get('/crm-live', controller.crmLive);
router.post('/business-cycle', controller.businessCycle);

module.exports = router;
