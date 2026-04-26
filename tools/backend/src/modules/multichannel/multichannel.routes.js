const express = require('express');
const controller = require('./multichannel.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.post('/route-message', controller.routeMessage);
router.post('/execute-next', controller.executeNext);

module.exports = router;
