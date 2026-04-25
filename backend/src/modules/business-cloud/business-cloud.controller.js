const service = require('./business-cloud.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function createTeam(req, res) { res.json(service.createTeam(req.body || {})); }
function createLead(req, res) { res.json(service.createLead(req.body || {})); }
function addFinanceEntry(req, res) { res.json(service.addFinanceEntry(req.body || {})); }
function updateGoalProgress(req, res) { res.json(service.updateGoalProgress(req.body || {})); }
function generateInsight(req, res) { res.json(service.generateInsight(req.body || {})); }

module.exports = { dashboard, createTeam, createLead, addFinanceEntry, updateGoalProgress, generateInsight };
