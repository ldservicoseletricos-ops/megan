const service = require('./megan-voice.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function wake(req, res) { res.json(service.wake(req.body || {})); }
function command(req, res) { res.json(service.executeVoiceCommand(req.body || {})); }
function registerDevice(req, res) { res.json(service.registerDevice(req.body || {})); }
function setMode(req, res) { res.json(service.setMode(req.body || {})); }
function confirmSafety(req, res) { res.json(service.confirmSafety(req.body || {})); }

module.exports = { dashboard, wake, command, registerDevice, setMode, confirmSafety };
