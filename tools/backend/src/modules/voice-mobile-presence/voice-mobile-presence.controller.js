const service = require('./voice-mobile-presence.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function registerDevice(req, res) { res.json(service.registerDevice(req.body || {})); }
function runVoiceCommand(req, res) { res.json(service.runVoiceCommand(req.body || {})); }

module.exports = { dashboard, registerDevice, runVoiceCommand };
