function decideGovernanceAction({ context = 'balanced', layeredPolicies = [], voting = null, payload = {} } = {}) {
  const blockedActions = layeredPolicies.find((layer) => layer.id === 'restricted')?.scope || [];
  const actionType = payload.actionType || payload.missionType || 'coordinated_execution';

  if (blockedActions.includes(actionType)) {
    return {
      ok: true,
      outcome: 'blocked',
      reason: 'Ação protegida pela camada crítica.',
      recommendedMode: 'explicit_approval',
    };
  }

  const dominantBrain = voting?.dominant?.id || 'autonomy';
  const weightedApproval = voting?.totalWeight ? Math.min(0.96, (voting.dominant.weight / voting.totalWeight) + 0.22) : 0.62;

  if (context === 'critical_risk' && dominantBrain !== 'guardian') {
    return {
      ok: true,
      outcome: 'escalated',
      reason: 'Contexto crítico exige liderança guardiã.',
      recommendedMode: 'guardian_validation',
    };
  }

  return {
    ok: true,
    outcome: weightedApproval >= 0.6 ? 'approved' : 'review',
    reason: 'Decisão calculada por pesos contextuais.',
    recommendedMode: weightedApproval >= 0.6 ? 'validated_execution' : 'supervised_autonomy',
    dominantBrain,
    weightedApproval: Number(weightedApproval.toFixed(2)),
  };
}

module.exports = { decideGovernanceAction };
