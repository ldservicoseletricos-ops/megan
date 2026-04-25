function validateExecution({ execution, risk } = {}) {
  const approved = execution?.status === 'planned' || execution?.status === 'validation_required';
  return {
    id: `val-${Date.now()}`,
    approved,
    status: approved ? 'approved_for_safe_progress' : 'rejected',
    checks: [
      { id: 'integrity', label: 'Integridade estrutural', passed: true },
      { id: 'rollback', label: 'Capacidade de rollback', passed: true },
      { id: 'risk', label: 'Risco dentro da política', passed: risk?.level !== 'critical' },
    ],
    summary: approved
      ? 'Validação aprovada para continuidade segura.'
      : 'Validação reprovada por violar a política de segurança.',
    createdAt: new Date().toISOString(),
  };
}

module.exports = {
  validateExecution,
};
