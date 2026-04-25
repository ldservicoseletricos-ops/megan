const service = require('./operating-network.service');

function overview(_req, res) {
  return res.json(service.getOperatingNetwork());
}

module.exports = { overview };
