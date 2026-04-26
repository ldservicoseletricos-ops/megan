const { buildBrains } = require('./brain-registry.service');
const { buildConsensus } = require('./consensus-engine.service');

function buildCoordinationPlan({ state = {}, mission = null } = {}) {
  const brains = buildBrains(state);
  const consensus = buildConsensus({ state, mission, candidateAction: { title: mission?.title || 'Coordenação de missão' } });
  const sorted = [...brains].sort((a, b) => (b.autonomyLevel - a.autonomyLevel) || (a.load - b.load));
  const leadBrain = sorted[0] || null;
  const supportBrains = sorted.slice(1, 4);
  return {
    ok: true,
    missionId: mission?.id || null,
    missionTitle: mission?.title || 'Missão coordenada',
    leadBrain,
    supportBrains,
    mode: consensus.approved ? 'coordinated_execution' : 'guarded_review',
    consensus,
    executionWindow: consensus.approved ? 'immediate' : 'awaiting_review',
    summary: leadBrain
      ? `${leadBrain.label} conduz a execução com suporte coordenado de ${(supportBrains.map((item) => item.label).join(', ') || 'nenhum outro cérebro')}.`
      : 'Nenhum cérebro disponível para coordenar a missão.',
    generatedAt: new Date().toISOString(),
  };
}

function executeCoordination({ state = {}, mission = null } = {}) {
  const plan = buildCoordinationPlan({ state, mission });
  return {
    ok: true,
    executed: Boolean(plan.leadBrain) && plan.consensus.approved,
    status: Boolean(plan.leadBrain) && plan.consensus.approved ? 'coordinated' : 'review_required',
    plan,
    resultSummary: Boolean(plan.leadBrain) && plan.consensus.approved
      ? `Execução coordenada aprovada por consenso para ${plan.leadBrain.label}.`
      : 'Coordenação registrada, aguardando reforço de consenso.',
  };
}

module.exports = { buildCoordinationPlan, executeCoordination };
