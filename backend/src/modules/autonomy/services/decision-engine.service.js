function chooseDecision({ activeGoal, priorities = [], mode = 'supervised_autonomy' } = {}) {
  const topPriority = priorities[0] || null;

  const actionType = topPriority?.priority === 'critical'
    ? 'generate_patch_plan'
    : 'analyze_system';

  return {
    id: `decision-${Date.now()}`,
    mode,
    actionType,
    title: topPriority?.title || 'Executar nova análise do sistema',
    reason: topPriority?.rationale || 'Sem prioridade crítica explícita, o núcleo decide observar e consolidar.',
    expectedImpact: topPriority?.impact || 'medium',
    relatedGoalId: activeGoal?.id || null,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  chooseDecision,
};
