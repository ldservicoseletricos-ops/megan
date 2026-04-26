const service = require('./multichannel.service');

function dashboard(_req, res) {
  res.json(service.getDashboard());
}

function routeMessage(req, res) {
  res.json(service.routeMessage(req.body || {}));
}

function executeNext(_req, res) {
  res.json(service.executeNext());
}

module.exports = { dashboard, routeMessage, executeNext };
