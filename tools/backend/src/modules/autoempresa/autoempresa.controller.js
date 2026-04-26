const engine = require('./services/autoempresa-engine.service');

function dashboard(_req, res) {
  res.json(engine.getDashboard());
}

function metrics(_req, res) {
  res.json(engine.getMetrics());
}

function crmLive(_req, res) {
  res.json(engine.getCrmLive());
}

function captureLead(req, res) {
  res.status(201).json(engine.captureLead(req.body || {}));
}

function replyCustomer(req, res) {
  res.json(engine.replyCustomer(req.body || {}));
}

function createProposal(req, res) {
  res.status(201).json(engine.createProposal(req.body || {}));
}

function createFollowUp(req, res) {
  res.status(201).json(engine.createFollowUp(req.body || {}));
}

function createBillingAction(req, res) {
  res.status(201).json(engine.createBillingAction(req.body || {}));
}

function businessCycle(req, res) {
  res.json(engine.runBusinessCycle(req.body || {}));
}

module.exports = {
  dashboard,
  metrics,
  crmLive,
  captureLead,
  replyCustomer,
  createProposal,
  createFollowUp,
  createBillingAction,
  businessCycle,
};
