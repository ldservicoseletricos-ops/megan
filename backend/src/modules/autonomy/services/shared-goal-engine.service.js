function buildSharedGoals(state = {}) {
  const goals = Array.isArray(state.goals) ? state.goals : [];
  const missions = Array.isArray(state.missions) ? state.missions : [];
  const activeGoals = goals.filter((goal) => goal.status !== 'completed');
  const items = activeGoals.map((goal, index) => {
    const linkedMissions = missions.filter((mission) => {
      const text = `${mission.title || ''} ${mission.summary || ''}`.toLowerCase();
      const goalText = `${goal.title || ''} ${goal.summary || ''}`.toLowerCase();
      return text && goalText && (text.includes(goal.title?.toLowerCase?.() || '') || goalText.includes(mission.title?.toLowerCase?.() || ''));
    });
    const alignmentScore = Math.max(52, Math.min(98, 62 + linkedMissions.length * 8 + (goal.priority === 'critical' ? 10 : 0) - index * 2));
    return {
      id: goal.id,
      title: goal.title,
      summary: goal.summary,
      priority: goal.priority,
      ownerBrains: ['strategic', 'operational', 'technical', 'guardian'],
      linkedMissionIds: linkedMissions.map((mission) => mission.id),
      stageCount: linkedMissions.length || 1,
      alignmentScore,
      status: goal.status || 'active',
      updatedAt: goal.updatedAt || goal.createdAt || new Date().toISOString(),
    };
  });
  return { ok: true, items, generatedAt: new Date().toISOString() };
}

function createSharedGoal(state = {}, payload = {}) {
  const goal = {
    id: payload.id || `shared-goal-${Date.now()}`,
    title: payload.title || 'Meta compartilhada entre cérebros',
    summary: payload.summary || 'Meta criada para alinhar decisões, execução e proteção da base.',
    type: payload.type || 'shared_autonomy_goal',
    status: 'active',
    priority: payload.priority || 'high',
    successCriteria: Array.isArray(payload.successCriteria) && payload.successCriteria.length ? payload.successCriteria : [
      'Consenso interno acima de 70',
      'Execução sem regressão crítica',
      'Missões alinhadas entre cérebros',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.goals = [goal, ...(state.goals || [])];
  return { state, goal, sharedGoals: buildSharedGoals(state).items };
}

module.exports = { buildSharedGoals, createSharedGoal };
