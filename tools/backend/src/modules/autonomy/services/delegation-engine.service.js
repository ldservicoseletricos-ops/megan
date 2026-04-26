const { buildBrains } = require('./brain-registry.service');
const { buildModuleSpecializations } = require('./module-specialization.service');

function rankBrainsForMission(mission = {}, state = {}) {
  const brains = buildBrains(state);
  const specializations = buildModuleSpecializations();
  const missionText = `${mission.title || ''} ${mission.summary || ''}`.toLowerCase();
  return brains.map((brain) => {
    const specializationMatches = specializations.filter((item) => item.ownerBrain === brain.id && missionText.includes((item.id || '').toLowerCase())).length;
    const preferredMatches = (brain.preferredMissionTypes || []).filter((type) => missionText.includes(String(type).toLowerCase())).length;
    const score = Math.round((brain.autonomyLevel || 0) * 0.45 + (100 - (brain.load || 0)) * 0.2 + preferredMatches * 18 + specializationMatches * 12);
    return {
      brain,
      score,
      reason: preferredMatches > 0
        ? `${brain.label} tem alinhamento direto com a missão e menor custo decisório.`
        : `${brain.label} foi escolhido pelo equilíbrio entre autonomia, carga e especialização.`,
    };
  }).sort((a, b) => b.score - a.score);
}

function buildDelegationPlan({ mission = {}, state = {} } = {}) {
  const ranking = rankBrainsForMission(mission, state);
  const primary = ranking[0] || null;
  const support = ranking.slice(1, 3).map((item) => item.brain);
  return {
    ok: true,
    missionId: mission.id || null,
    missionTitle: mission.title || 'Missão sem título',
    primaryBrain: primary?.brain || null,
    supportBrains: support,
    ranking,
    summary: primary ? `${primary.brain.label} assume a missão com suporte coordenado de ${support.map((item) => item.label).join(' e ') || 'nenhum outro cérebro'}.` : 'Nenhum cérebro disponível para delegação.',
    createdAt: new Date().toISOString(),
  };
}

function dispatchDelegation({ mission = {}, state = {} } = {}) {
  const plan = buildDelegationPlan({ mission, state });
  return {
    ok: true,
    dispatched: Boolean(plan.primaryBrain),
    status: plan.primaryBrain ? 'delegated' : 'unassigned',
    plan,
    resultSummary: plan.primaryBrain ? `Missão delegada para ${plan.primaryBrain.label} com apoio coordenado.` : 'Delegação não executada.',
  };
}

module.exports = { rankBrainsForMission, buildDelegationPlan, dispatchDelegation };
