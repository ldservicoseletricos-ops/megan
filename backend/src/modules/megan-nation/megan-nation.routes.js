const express = require('express');
const controller = require('./megan-nation.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/community', controller.community);
router.get('/marketplace', controller.marketplace);
router.get('/ai-teams', controller.aiTeams);
router.get('/jobs', controller.jobs);
router.post('/community/join', controller.joinCommunity);
router.post('/marketplace/offer', controller.createOffer);
router.post('/ai-teams/form', controller.formAiTeam);
router.post('/jobs/execute', controller.executeJob);

module.exports = router;
