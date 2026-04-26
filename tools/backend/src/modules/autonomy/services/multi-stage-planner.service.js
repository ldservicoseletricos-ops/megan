function buildStagePlan({ goals = [], missions = [], ranking = [] }) {
  const now = new Date().toISOString();
  const stages = [];
  goals.filter((goal) => goal.status !== 'completed').forEach((goal, goalIndex) => {
    const ranked = ranking.filter((item) => !item.mission.goalId || item.mission.goalId === goal.id).slice(0, 3);
    const queued = missions.filter((mission) => mission.status !== 'completed').slice(0, 3);
    const source = ranked.length ? ranked : queued.map((mission) => ({ mission, impact: { totalScore: 50, rationale: 'Missão mantida no plano por continuidade operacional.' } }));
    source.forEach((item, idx) => {
      const title = idx === 0 ? 'Blindar base atual' : idx === 1 ? 'Expandir autonomia validada' : 'Preparar avanço estratégico';
      stages.push({
        id: `stage-${goal.id}-${idx + 1}`,
        goalId: goal.id,
        title,
        description: item.impact.rationale,
        status: idx === 0 ? 'active' : 'planned',
        progress: idx === 0 ? 35 : 0,
        order: goalIndex * 10 + idx + 1,
        missionTitle: item.mission.title,
        expectedImpactScore: item.impact.totalScore,
        updatedAt: now,
      });
    });
  });
  return { ok: true, items: stages.sort((a, b) => a.order - b.order), generatedAt: now };
}
module.exports = { buildStagePlan };
