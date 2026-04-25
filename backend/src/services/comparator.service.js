function score(state) {
  return (
    state.memoryConsistency * 0.12 +
    state.criticStability * 0.12 +
    state.regressionCoverage * 0.12 +
    state.rollbackSafety * 0.12 +
    state.sandboxReliability * 0.12 +
    state.realPatchReadiness * 0.12 +
    state.gitReadiness * 0.10 +
    state.buildReadiness * 0.10 +
    state.deployReadiness * 0.08
  );
}

function requiredGainFor(patch) {
  if (patch?.risk === 'low') return 0.8;
  if (patch?.risk === 'medium') return 1.2;
  return 1.4;
}

function compare(before, after, patch) {
  const gain = Math.round((score(after) - score(before)) * 10) / 10;
  const threshold = requiredGainFor(patch);
  const approved = gain >= threshold;
  return {
    approved,
    gain,
    threshold,
    reason: approved
      ? `Patch aprovado com ganho ${gain} acima do mínimo ${threshold}.`
      : `Patch rejeitado; ganho ${gain} abaixo do mínimo ${threshold}.`,
    patch,
  };
}

module.exports = { compare };
