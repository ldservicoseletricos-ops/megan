const express = require('express');
const controller = require('./agents.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.post('/plan', controller.plan);
router.post('/run', controller.run);
router.post('/orchestrate', controller.orchestrate);
router.post('/consensus', controller.consensus);
router.post('/timeline', controller.timeline);

module.exports = router;
