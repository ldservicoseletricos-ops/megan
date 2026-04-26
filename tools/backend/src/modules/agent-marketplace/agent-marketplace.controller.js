const service = require('./agent-marketplace.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function installAgent(req, res) { res.json(service.installAgent(req.body || {})); }
function purchaseAgent(req, res) { res.json(service.purchaseAgent(req.body || {})); }
function assignAgent(req, res) { res.json(service.assignAgent(req.body || {})); }
function runDemo(req, res) { res.json(service.runDemo(req.body || {})); }
function reviewAgent(req, res) { res.json(service.reviewAgent(req.body || {})); }

module.exports = { dashboard, installAgent, purchaseAgent, assignAgent, runDemo, reviewAgent };
