function buildLongRangePriorities({ goals = [], futureImpact = {}, ranking = [] }) {
  const priorities = ranking.slice(0, 5).map((item, index) => ({
    order: index + 1,
    missionId: item.mission.id,
    title: item.mission.title,
    priority: item.mission.priority,
    impactScore: item.impact.totalScore,
    horizon: index < 2 ? 'agora' : index < 4 ? 'próximos ciclos' : 'depois',
  }));
  return {
    ok: true,
    activeGoals: goals.filter((goal) => goal.status !== 'completed').length,
    priorities,
    summary: futureImpact.summary || 'Prioridades de longo prazo calculadas.',
    generatedAt: new Date().toISOString(),
  };
}
module.exports = { buildLongRangePriorities };
