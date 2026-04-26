const engine = require('./services/personal-copilot-engine.service');

function dashboard(_req, res) { res.json(engine.getDashboard()); }
function agenda(_req, res) { res.json(engine.getAgenda()); }
function metrics(_req, res) { res.json(engine.getMetrics()); }
function dailyFocus(req, res) { res.json(engine.createDailyFocus(req.body || {})); }
function createGoal(req, res) { res.status(201).json(engine.createGoal(req.body || {})); }
function healthCheckin(req, res) { res.status(201).json(engine.createHealthCheckin(req.body || {})); }
function addFinanceItem(req, res) { res.status(201).json(engine.addFinanceItem(req.body || {})); }
function createReminder(req, res) { res.status(201).json(engine.createReminder(req.body || {})); }
function assistDecision(req, res) { res.json(engine.assistDecision(req.body || {})); }
function runLifeCycle(req, res) { res.json(engine.runLifeCycle(req.body || {})); }

module.exports = { dashboard, agenda, metrics, dailyFocus, createGoal, healthCheckin, addFinanceItem, createReminder, assistDecision, runLifeCycle };
