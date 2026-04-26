const express = require('express');
const controller = require('./megan-app-store.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/catalog', controller.catalog);
router.post('/install', controller.installModule);
router.post('/purchase', controller.purchaseModule);
router.post('/theme/apply', controller.applyTheme);
router.post('/automation/enable', controller.enableAutomation);
router.post('/integration/connect', controller.connectIntegration);

module.exports = router;
