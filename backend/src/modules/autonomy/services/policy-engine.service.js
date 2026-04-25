function classifyAction(actionType = '', policies = {}) {
  const automatic = policies.allowedWithoutApproval || [];
  const validated = policies.allowedWithValidation || [];
  const blocked = policies.blockedWithoutExplicitApproval || [];

  if (blocked.includes(actionType)) return { allowed: false, mode: 'blocked' };
  if (automatic.includes(actionType)) return { allowed: true, mode: 'automatic' };
  if (validated.includes(actionType)) return { allowed: true, mode: 'validated' };
  return { allowed: false, mode: 'unknown' };
}

module.exports = {
  classifyAction,
};
