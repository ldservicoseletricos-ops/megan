function getActiveGoal(goals = []) {
  return goals.find((goal) => goal.status === 'active') || goals[0] || null;
}

function upsertGoal(goals = [], payload = {}) {
  const now = new Date().toISOString();
  const nextGoal = {
    id: payload.id || `goal-${Date.now()}`,
    title: payload.title || 'Meta operacional não informada',
    summary: payload.summary || 'Meta criada pelo núcleo autônomo.',
    type: payload.type || 'system_evolution',
    status: payload.status || 'active',
    priority: payload.priority || 'high',
    successCriteria: Array.isArray(payload.successCriteria) && payload.successCriteria.length > 0
      ? payload.successCriteria
      : ['Concluir a meta sem regressão crítica.'],
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };

  const filtered = goals.filter((item) => item.id !== nextGoal.id).map((item) => ({
    ...item,
    status: payload.status === 'active' ? 'queued' : item.status,
  }));

  if (nextGoal.status === 'active') {
    return [nextGoal, ...filtered];
  }

  return [nextGoal, ...filtered];
}

module.exports = {
  getActiveGoal,
  upsertGoal,
};
