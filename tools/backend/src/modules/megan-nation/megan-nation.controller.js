const service = require('./megan-nation.service');

function dashboard(_req, res) { res.json(service.getDashboard()); }
function community(_req, res) { res.json(service.getCommunity()); }
function marketplace(_req, res) { res.json(service.getMarketplace()); }
function aiTeams(_req, res) { res.json(service.getAiTeams()); }
function jobs(_req, res) { res.json(service.getJobs()); }
function joinCommunity(req, res) { res.json(service.joinCommunity(req.body || {})); }
function createOffer(req, res) { res.json(service.createOffer(req.body || {})); }
function formAiTeam(req, res) { res.json(service.formAiTeam(req.body || {})); }
function executeJob(req, res) { res.json(service.executeJob(req.body || {})); }

module.exports = { dashboard, community, marketplace, aiTeams, jobs, joinCommunity, createOffer, formAiTeam, executeJob };
