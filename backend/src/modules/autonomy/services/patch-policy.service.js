function getPatchPolicy(mode = 'supervised_autonomy') {
  return {
    mode,
    autoAllowed: [
      'update_autonomy_state',
      'rebalance_mission_queue',
      'improve_autonomy_copy',
      'register_patch_proposal',
      'synchronize_autonomy_scores',
    ],
    validationRequired: [
      'update_autonomy_route_metadata',
      'tune_autonomy_frontend_panel',
      'apply_safe_local_patch',
    ],
    blocked: [
      'deploy_to_production',
      'delete_critical_files',
      'rewrite_auth_core',
      'modify_production_credentials',
      'drop_database_data',
      'change_billing_rules',
    ],
  };
}

function classifyPatchAction(actionType, mode) {
  const policy = getPatchPolicy(mode);
  if (policy.blocked.includes(actionType)) return 'blocked';
  if (policy.validationRequired.includes(actionType)) return 'validation_required';
  if (policy.autoAllowed.includes(actionType)) return 'auto_allowed';
  return mode === 'continuous_autonomy' ? 'validation_required' : 'auto_allowed';
}

module.exports = { getPatchPolicy, classifyPatchAction };
