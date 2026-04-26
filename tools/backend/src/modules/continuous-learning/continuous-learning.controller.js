const engine = require('./services/continuous-learning-engine.service');

function dashboard(_req, res) { res.json(engine.getDashboard()); }
function patterns(_req, res) { res.json(engine.getPatterns()); }
function predictions(_req, res) { res.json(engine.getPredictions()); }
function preferences(_req, res) { res.json(engine.getPreferences()); }
function recordUse(req, res) { res.status(201).json(engine.recordUse(req.body || {})); }
function optimizeRoutine(req, res) { res.json(engine.optimizeRoutine(req.body || {})); }
function improveResponse(req, res) { res.json(engine.improveResponse(req.body || {})); }
function runLearningCycle(req, res) { res.json(engine.runLearningCycle(req.body || {})); }

module.exports = { dashboard, patterns, predictions, preferences, recordUse, optimizeRoutine, improveResponse, runLearningCycle };
