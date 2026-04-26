function buildExceptionRules(state = {}) {
  const riskLevel = state?.state?.riskLevel || 'medium';
  return {
    ok: true,
    riskLevel,
    exceptions: [
      { id: 'critical-login-failure', title: 'Falha crítica de login', canOverride: ['normal_priority_queue'], requires: ['health_probe', 'rollback_ready'], maxRisk: 'medium' },
      { id: 'frontend-white-screen', title: 'Tela branca no frontend', canOverride: ['visual_backlog'], requires: ['build_validation', 'component_isolation'], maxRisk: 'medium' },
      { id: 'backend-down', title: 'Backend fora do ar', canOverride: ['market_competition', 'mission_auction'], requires: ['port_check', 'start_command_validation'], maxRisk: 'high' },
      { id: 'download-artifact-broken', title: 'Artefato quebrado', canOverride: ['single_package_delivery'], requires: ['zip_integrity_test', 'alternate_naming'], maxRisk: 'low' },
    ],
    blockedOverrides: ['delete_critical_files', 'modify_secret_values', 'drop_database', 'disable_auth'],
    updatedAt: new Date().toISOString(),
  };
}

function evaluateException(payload = {}, state = {}) {
  const rules = buildExceptionRules(state).exceptions;
  const requested = payload.exceptionId || payload.id || 'frontend-white-screen';
  const rule = rules.find((item) => item.id === requested) || rules[0];
  const approved = !buildExceptionRules(state).blockedOverrides.includes(payload.override || '');
  return {
    ok: true,
    approved,
    exception: rule,
    decision: approved ? 'exception_granted_with_constraints' : 'exception_blocked',
    constraints: rule.requires,
    evaluatedAt: new Date().toISOString(),
  };
}

module.exports = { buildExceptionRules, evaluateException };
