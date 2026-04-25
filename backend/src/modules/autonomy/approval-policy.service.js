function getPolicies() {
  return {
    automatic: [
      'retry_health_checks',
      'fallback_safe_mode',
      'temporary_module_degradation',
      'cache_reset_runtime',
      'patch_runtime_fallback',
      'patch_port_isolation',
    ],
    approvalRequired: [
      'patch_application',
      'module_consolidation',
      'route_rewire',
      'deploy_change',
      'patch_route_export_check',
    ],
    blocked: [
      'billing_mutation',
      'auth_critical_change',
      'schema_destructive_change',
      'secret_rotation_without_review',
    ],
  };
}

function canRun(actionType = '') {
  const policies = getPolicies();
  if (policies.automatic.includes(actionType)) return { allowed: true, mode: 'automatic' };
  if (policies.approvalRequired.includes(actionType)) return { allowed: false, mode: 'approval_required' };
  if (policies.blocked.includes(actionType)) return { allowed: false, mode: 'blocked' };
  return { allowed: false, mode: 'unknown' };
}

module.exports = {
  getPolicies,
  canRun,
};
