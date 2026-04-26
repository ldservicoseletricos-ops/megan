const engine = require('./services/autonomous-agents-engine.service');

function dashboard(_req, res) { res.json(engine.getDashboard()); }
function agents(_req, res) { res.json(engine.getAgents()); }
function queue(_req, res) { res.json(engine.getQueue()); }
function executions(_req, res) { res.json(engine.getExecutions()); }
function runCycle(req, res) { res.json(engine.runAgentCycle(req.body || {})); }
function addTask(req, res) { res.status(201).json(engine.addTask(req.body || {})); }
function updateAgentStatus(req, res) { res.json(engine.updateAgentStatus(req.body || {})); }
function approveAction(req, res) { res.json(engine.approveAction(req.body || {})); }

module.exports = { dashboard, agents, queue, executions, runCycle, addTask, updateAgentStatus, approveAction };
