const service = require('./personal-life.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function addRoutineTask(req, res) { res.json(service.addRoutineTask(req.body || {})); }
function updateGoalProgress(req, res) { res.json(service.updateGoalProgress(req.body || {})); }
function addHealthCheckin(req, res) { res.json(service.addHealthCheckin(req.body || {})); }
function addMoneyEntry(req, res) { res.json(service.addMoneyEntry(req.body || {})); }
function addFocusSession(req, res) { res.json(service.addFocusSession(req.body || {})); }
function addProductivityAction(req, res) { res.json(service.addProductivityAction(req.body || {})); }

module.exports = { dashboard, addRoutineTask, updateGoalProgress, addHealthCheckin, addMoneyEntry, addFocusSession, addProductivityAction };
