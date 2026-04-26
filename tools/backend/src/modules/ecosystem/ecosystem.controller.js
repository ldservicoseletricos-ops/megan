const service = require('./ecosystem.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function createTenant(req, res) { res.json(service.createTenant(req.body || {})); }
function createUser(req, res) { res.json(service.createUser(req.body || {})); }
function subscribePlan(req, res) { res.json(service.subscribePlan(req.body || {})); }
function installModule(req, res) { res.json(service.installModule(req.body || {})); }
function applyWhiteLabel(req, res) { res.json(service.applyWhiteLabel(req.body || {})); }
function runWorldReadyChecklist(req, res) { res.json(service.runWorldReadyChecklist(req.body || {})); }

module.exports = { dashboard, createTenant, createUser, subscribePlan, installModule, applyWhiteLabel, runWorldReadyChecklist };
