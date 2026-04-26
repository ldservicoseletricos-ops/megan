function buildRoadmap({ goals = [], stages = [], ranking = [] }) {
  const roadmap = [];
  let lane = 1;
  goals.filter((goal) => goal.status !== 'completed').forEach((goal) => {
    const goalStages = stages.filter((stage) => stage.goalId === goal.id);
    goalStages.forEach((stage, index) => {
      roadmap.push({
        id: `roadmap-${goal.id}-${index + 1}`,
        lane,
        goalId: goal.id,
        title: stage.title,
        status: stage.status,
        progress: stage.progress,
        missionTitle: stage.missionTitle,
        expectedImpactScore: stage.expectedImpactScore,
        milestone: index === goalStages.length - 1 ? 'Consolidar entrega' : 'Executar etapa',
      });
    });
    lane += 1;
  });
  if (!roadmap.length && ranking.length) {
    roadmap.push(...ranking.slice(0,3).map((item, index) => ({
      id: `roadmap-fallback-${index+1}`,
      lane: 1,
      goalId: 'fallback',
      title: item.mission.title,
      status: index === 0 ? 'active' : 'planned',
      progress: item.mission.progress || 0,
      missionTitle: item.mission.title,
      expectedImpactScore: item.impact.totalScore,
      milestone: 'Fallback estratégico',
    })));
  }
  return { ok: true, items: roadmap, generatedAt: new Date().toISOString() };
}
module.exports = { buildRoadmap };
