function buildEmergencyRules(state = {}) {
  const incidents = state.incidents || [];
  const criticalIncidents = incidents.filter((item) => ['critical', 'high'].includes(item.severity));
  return {
    ok: true,
    mode: criticalIncidents.length >= 2 ? 'armed' : 'standby',
    rules: [
      { id: 'preserve-core', title: 'Preservar núcleo ativo', trigger: 'health_score_below_60', action: 'freeze_non_essential_actions', severity: 'critical' },
      { id: 'isolate-failing-module', title: 'Isolar módulo instável', trigger: 'same_module_3_errors', action: 'quarantine_module', severity: 'high' },
      { id: 'reduce-autonomy-scope', title: 'Reduzir autonomia temporariamente', trigger: 'rollback_or_critical_error', action: 'switch_to_supervised_autonomy', severity: 'high' },
      { id: 'recover-gradually', title: 'Recuperação progressiva', trigger: 'stable_after_containment', action: 'restore_modules_by_priority', severity: 'medium' }
    ],
    activeTriggers: criticalIncidents.map((item) => ({ id: item.id, source: item.source || item.module || 'system', severity: item.severity })),
    generatedAt: new Date().toISOString()
  };
}
function evaluateEmergency(payload = {}, state = {}) {
  const severity = payload.severity || 'high';
  const moduleName = payload.module || payload.source || 'autonomy';
  const critical = ['critical', 'high'].includes(severity);
  return {
    ok: true,
    shouldTrigger: critical,
    severity,
    module: moduleName,
    recommendedMode: critical ? 'crisis' : 'watch',
    containment: critical ? 'isolate_non_essential_actions' : 'monitor',
    reason: critical ? 'Evento de alta severidade exige modo crise e contenção imediata.' : 'Evento registrado para observação, sem crise ativa.',
    evaluatedAt: new Date().toISOString()
  };
}
module.exports = { buildEmergencyRules, evaluateEmergency };
