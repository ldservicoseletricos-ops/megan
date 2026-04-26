const orchestrator = require('./services/agent-orchestrator.service');
const collaboration = require('./services/agent-collaboration.service');

function handle(res, fn) {
  try {
    return res.json(fn());
  } catch (error) {
    return res.status(500).json({ ok: false, reason: error.message || 'Erro interno nos agentes.' });
  }
}

module.exports = {
  dashboard(_req, res) {
    return handle(res, () => orchestrator.getAgentsDashboard());
  },
  plan(req, res) {
    return handle(res, () => orchestrator.buildAgentPlan(req.body?.message || req.body?.goal || ''));
  },
  run(req, res) {
    return handle(res, () => orchestrator.runAgentMission(req.body || {}));
  },
  orchestrate(req, res) {
    return handle(res, () => collaboration.buildOrchestration(req.body || {}));
  },
  consensus(req, res) {
    return handle(res, () => collaboration.buildConsensusOnly(req.body || {}));
  },
  timeline(req, res) {
    return handle(res, () => collaboration.buildTimeline(req.body || {}));
  },
};
