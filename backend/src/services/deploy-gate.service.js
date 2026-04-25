
function evaluateDeploy(state, cycleSummary, buildCheck) {
  const score = Math.round(
    state.rollbackSafety * 0.18 +
    state.sandboxReliability * 0.18 +
    state.regressionCoverage * 0.18 +
    state.criticStability * 0.14 +
    state.realPatchReadiness * 0.12 +
    state.buildReadiness * 0.08 +
    state.gitReadiness * 0.05 +
    state.successRate * 0.07
  );

  const approved = score >= 74 && cycleSummary.approvedPatches > 0 && buildCheck.ok;

  return {
    approved,
    score,
    simulated: !!buildCheck.simulated,
    reason: approved ? 'Deploy gate liberado.' : 'Deploy gate bloqueado por segurança.'
  };
}

module.exports = { evaluateDeploy };

// MEGAN_AUTO_EVOLUTION_DEPLOY_MARKER
