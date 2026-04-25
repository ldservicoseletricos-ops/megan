
function diagnose(state) {
  const items = [];
  function add(area, score, severity, why) { items.push({ area, score, severity, why }); }

  if (state.memoryConsistency < 75) add('memory_core', 100 - state.memoryConsistency + 18, 'critical', 'Memória técnica ainda não sustenta autoevolução segura.');
  if (state.criticStability < 72) add('critic', 100 - state.criticStability + 16, 'high', 'Critic ainda oscila além do ideal.');
  if (state.regressionCoverage < 70) add('tests', 100 - state.regressionCoverage + 14, 'high', 'Cobertura de regressão ainda é baixa para mexer no próprio código.');
  if (state.rollbackSafety < 72) add('rollback', 100 - state.rollbackSafety + 14, 'high', 'Rollback automático ainda é insuficiente.');
  if (state.sandboxReliability < 72) add('sandbox', 100 - state.sandboxReliability + 14, 'high', 'Sandbox ainda não está forte o suficiente.');
  if (state.realPatchReadiness < 72) add('real_patch', 100 - state.realPatchReadiness + 12, 'high', 'Patch real em arquivo ainda não está maduro o suficiente.');
  if (state.gitReadiness < 70) add('git', 100 - state.gitReadiness + 10, 'medium', 'Integração Git ainda precisa maturidade.');
  if (state.buildReadiness < 70) add('build', 100 - state.buildReadiness + 10, 'medium', 'Checagem de build ainda não está madura.');
  if (state.deployReadiness < 70) add('deploy', 100 - state.deployReadiness + 10, 'medium', 'Gate de deploy ainda não está pronto.');
  return items.sort((a, b) => b.score - a.score);
}

module.exports = { diagnose };
