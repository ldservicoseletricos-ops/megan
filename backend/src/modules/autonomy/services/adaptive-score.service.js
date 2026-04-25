function clamp(value) { return Math.max(0, Math.min(100, Math.round(value))); }

function computeAdaptiveScores({ current = {}, validation = {}, risk = {}, missionImpact = {}, patch = {}, execution = {} }) {
  const successBoost = validation.approved ? 6 : -4;
  const riskAdjustment = risk.level === 'low' ? 4 : risk.level === 'medium' ? 1 : -3;
  const impactBoost = Math.min(8, Math.round((missionImpact.totalScore || 0) / 15));
  const patchBoost = patch?.kind === 'multi_file' ? 3 : patch?.status === 'applied' ? 2 : 0;
  const executionBoost = execution.status === 'completed' ? 3 : execution.status === 'validation_required' ? 1 : -2;

  return {
    autonomy: clamp((current.autonomyScore || 0) + successBoost + patchBoost + impactBoost),
    stability: clamp((current.stabilityScore || 0) + (validation.approved ? 3 : -2) + riskAdjustment),
    maturity: clamp((current.maturityScore || 0) + successBoost + impactBoost),
    assertiveness: clamp((current.assertivenessScore || 40) + (validation.approved ? 5 : -5) + executionBoost),
    operationalRisk: clamp((current.operationalRiskScore || 50) + (risk.level === 'high' ? 8 : risk.level === 'medium' ? 2 : -5)),
    resolutionVelocity: clamp((current.resolutionVelocityScore || 45) + (validation.approved ? 4 : -3) + (missionImpact.blockerRemovalScore || 0)),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { computeAdaptiveScores };
