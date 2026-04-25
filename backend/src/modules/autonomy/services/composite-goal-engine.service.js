function buildCompositeGoals(goals = [], missions = [], roadmap = []) {
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const mapped = activeGoals.map((goal, index) => {
    const relatedMissions = missions.filter((mission) => (mission.goalId && mission.goalId === goal.id) || (mission.status !== 'completed' && index === 0));
    const stages = roadmap.filter((stage) => stage.goalId === goal.id);
    const progress = stages.length
      ? Math.round(stages.reduce((sum, stage) => sum + Number(stage.progress || 0), 0) / stages.length)
      : Math.round(relatedMissions.reduce((sum, mission) => sum + Number(mission.progress || 0), 0) / Math.max(1, relatedMissions.length));
    return {
      id: goal.id,
      title: goal.title,
      summary: goal.summary,
      status: goal.status,
      priority: goal.priority,
      progress,
      children: stages.map((stage) => ({ id: stage.id, title: stage.title, status: stage.status, progress: stage.progress })),
      missionCount: relatedMissions.length,
      successCriteria: goal.successCriteria || [],
      updatedAt: goal.updatedAt || new Date().toISOString(),
    };
  });
  return { ok: true, items: mapped, count: mapped.length, generatedAt: new Date().toISOString() };
}
module.exports = { buildCompositeGoals };
