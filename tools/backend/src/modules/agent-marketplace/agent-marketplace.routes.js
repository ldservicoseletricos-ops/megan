const express = require('express');
const controller = require('./agent-marketplace.controller');

const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/agents/install', controller.installAgent);
router.post('/agents/purchase', controller.purchaseAgent);
router.post('/agents/assign', controller.assignAgent);
router.post('/agents/run-demo', controller.runDemo);
router.post('/agents/review', controller.reviewAgent);

module.exports = router;
