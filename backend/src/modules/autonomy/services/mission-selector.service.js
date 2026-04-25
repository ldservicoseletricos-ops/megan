const { getMissionOverview, activateMission } = require('./mission-queue.service');
const { rankMissionsByImpact } = require('./mission-impact-engine.service');

function scoreMission(mission, state = {}) {
  return rankMissionsByImpact([mission], state)[0]?.impact?.totalScore || 0;
}

function selectNextMission(missions = [], state = {}) {
  const overview = getMissionOverview(missions);
  if (overview.active) {
    return { selected: overview.active, reason: 'Já existe uma missão ativa no ciclo atual.', missions, autoActivated: false, ranking: rankMissionsByImpact(overview.queued, state) };
  }

  const ranking = rankMissionsByImpact(overview.queued || [], state);
  const selected = ranking[0]?.mission || null;
  if (!selected) {
    return { selected: null, reason: 'Nenhuma missão disponível para ativação automática.', missions, autoActivated: false, ranking };
  }

  const activatedMissions = activateMission(missions, selected.id);
  const nextOverview = getMissionOverview(activatedMissions);
  return { selected: nextOverview.active, reason: ranking[0]?.impact?.rationale || 'Missão escolhida automaticamente por impacto real.', missions: activatedMissions, autoActivated: true, ranking };
}

module.exports = { scoreMission, selectNextMission };
