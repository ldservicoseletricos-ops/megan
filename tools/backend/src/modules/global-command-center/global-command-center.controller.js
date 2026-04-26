const service = require('./global-command-center.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function runCommand(req, res) { res.json(service.runGlobalCommand(req.body || {})); }
function createGoal(req, res) { res.json(service.createGoal(req.body || {})); }
function resolveAlert(req, res) { res.json(service.resolveAlert(req.body || {})); }

module.exports = { dashboard, runCommand, createGoal, resolveAlert };
