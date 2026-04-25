function calculateRisk({ priority = 'medium', mode = 'supervised_autonomy', actionType = 'analyze_system' } = {}) {
  const blockedActions = ['deploy_to_production', 'delete_critical_files', 'modify_production_credentials'];
  if (blockedActions.includes(actionType)) {
    return {
      level: 'critical',
      score: 96,
      reason: 'Ação sensível e destrutiva bloqueada para autonomia total.',
    };
  }

  const baseByPriority = {
    critical: 72,
    high: 58,
    medium: 38,
    low: 22,
  };

  let score = baseByPriority[priority] || 40;
  if (mode === 'observer') score -= 12;
  if (mode === 'validated_execution') score += 8;
  if (String(actionType).includes('patch')) score += 10;
  if (String(actionType).includes('repair')) score += 6;

  const level = score >= 85 ? 'critical' : score >= 65 ? 'high' : score >= 40 ? 'medium' : 'low';

  return {
    level,
    score,
    reason: level === 'low'
      ? 'Ação segura e reversível.'
      : level === 'medium'
        ? 'Ação útil, mas com impacto em áreas existentes.'
        : 'Ação relevante com possibilidade de regressão e necessidade de validação.',
  };
}

module.exports = {
  calculateRisk,
};
