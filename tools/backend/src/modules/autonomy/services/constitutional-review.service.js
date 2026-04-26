function reviewActionAgainstConstitution(payload = {}, constitution = {}, exceptions = {}) {
  const actionType = payload.actionType || payload.type || 'generate_patch_plan';
  const critical = ['delete_critical_files', 'modify_secret_values', 'drop_database', 'deploy_to_production'];
  const blocked = critical.includes(actionType);
  const requiresException = actionType.includes('override') || actionType.includes('critical');
  return {
    ok: true,
    actionType,
    approved: !blocked,
    requiresException,
    requiredAuthorityLevel: blocked ? 4 : requiresException ? 3 : 2,
    constitutionPrinciplesChecked: (constitution.principles || []).map((item) => item.id),
    exceptionRulesChecked: (exceptions.exceptions || []).map((item) => item.id),
    decision: blocked ? 'blocked_by_constitution' : requiresException ? 'approved_with_exception_review' : 'approved',
    reviewedAt: new Date().toISOString(),
  };
}

module.exports = { reviewActionAgainstConstitution };
