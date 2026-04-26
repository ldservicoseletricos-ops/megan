const service = require('./megan-app-store.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function catalog(_req, res) { res.json(service.getCatalog()); }
function installModule(req, res) { res.json(service.installModule(req.body || {})); }
function purchaseModule(req, res) { res.json(service.purchaseModule(req.body || {})); }
function applyTheme(req, res) { res.json(service.applyTheme(req.body || {})); }
function enableAutomation(req, res) { res.json(service.enableAutomation(req.body || {})); }
function connectIntegration(req, res) { res.json(service.connectIntegration(req.body || {})); }

module.exports = { dashboard, catalog, installModule, purchaseModule, applyTheme, enableAutomation, connectIntegration };
