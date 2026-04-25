function buildRollbackPlan({ decision, execution } = {}) {
  return {
    id: `rollback-${Date.now()}`,
    required: execution?.status === 'blocked',
    summary: execution?.status === 'blocked'
      ? 'Rollback preventivo: nenhuma alteração aplicada, manter estado anterior.'
      : 'Rollback preparado apenas como contingência; nenhuma reversão necessária agora.',
    targetAction: decision?.actionType || null,
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  buildRollbackPlan,
};
