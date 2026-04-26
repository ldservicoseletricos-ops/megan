const express = require('express');
const controller = require('./megan-voice.controller');

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.post('/wake', controller.wake);
router.post('/command', controller.command);
router.post('/device', controller.registerDevice);
router.post('/mode', controller.setMode);
router.post('/safety/confirm', controller.confirmSafety);

module.exports = router;
