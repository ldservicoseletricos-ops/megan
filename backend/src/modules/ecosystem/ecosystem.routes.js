const express = require('express');
const controller = require('./ecosystem.controller');

const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/tenant', controller.createTenant);
router.post('/user', controller.createUser);
router.post('/plan/subscribe', controller.subscribePlan);
router.post('/marketplace/install', controller.installModule);
router.post('/white-label/apply', controller.applyWhiteLabel);
router.post('/world-ready/checklist', controller.runWorldReadyChecklist);

module.exports = router;
