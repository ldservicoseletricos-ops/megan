const express = require('express');
const controller = require('./continuous-learning.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/patterns', controller.patterns);
router.get('/predictions', controller.predictions);
router.get('/preferences', controller.preferences);
router.post('/record-use', controller.recordUse);
router.post('/optimize-routine', controller.optimizeRoutine);
router.post('/improve-response', controller.improveResponse);
router.post('/learning-cycle', controller.runLearningCycle);

module.exports = router;
