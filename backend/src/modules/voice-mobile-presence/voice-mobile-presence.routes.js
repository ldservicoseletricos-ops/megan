const express = require('express');
const controller = require('./voice-mobile-presence.controller');

const router = express.Router();
router.get('/dashboard', controller.dashboard);
router.post('/device/register', controller.registerDevice);
router.post('/voice-command', controller.runVoiceCommand);

module.exports = router;
