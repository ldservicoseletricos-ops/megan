function createScenario(id, title, strategy, risk, impact, probability, horizon, actions = []) {
  return { id, title, strategy, risk, impact, probability, horizon, actions, expectedOutcome: impact >= 80 ? 'alto ganho provável' : impact >= 60 ? 'ganho equilibrado' : 'ganho controlado' };
}
function buildFutureScenarios(state = {}) {
  const activeMission = (state.missions || []).find((mission) => mission.status === 'active') || (state.missions || [])[0];
  const riskLevel = state.state?.riskLevel || 'medium';
  const baseTitle = activeMission?.title || state.state?.currentGoal || 'Evolução autônoma segura';
  const riskPenalty = riskLevel === 'high' || riskLevel === 'critical' ? 15 : riskLevel === 'medium' ? 7 : 2;
  return [
    createScenario('balanced-growth', 'Crescimento equilibrado', 'balanced', 38 + riskPenalty, 78, 84 - Math.floor(riskPenalty / 2), '7 dias', [`Consolidar ${baseTitle}`, 'Executar validações antes de mudanças estruturais', 'Priorizar melhorias com rollback simples']),
    createScenario('safe-stability', 'Estabilidade conservadora', 'conservative', 18 + Math.floor(riskPenalty / 2), 62, 91 - Math.floor(riskPenalty / 3), '3 dias', ['Reduzir mudanças simultâneas', 'Fortalecer health checks e logs', 'Resolver gargalos conhecidos antes de expansão']),
    createScenario('accelerated-evolution', 'Evolução acelerada', 'aggressive', 56 + riskPenalty, 90, 68 - Math.floor(riskPenalty / 2), '14 dias', ['Criar melhorias multietapas', 'Delegar execução entre cérebros especialistas', 'Aplicar patch seguro com validação cruzada'])
  ];
}
module.exports = { buildFutureScenarios };
