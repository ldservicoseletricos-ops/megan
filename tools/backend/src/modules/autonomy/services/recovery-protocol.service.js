function buildRecoveryProtocol(state = {}) {
  const isolated = state.isolatedModules || [];
  const crisisActive = Boolean(state.crisis?.active);
  return { ok: true, phase: crisisActive ? 'stabilization' : 'normal', steps: [
    { id: 'verify-health', title: 'Verificar saúde do backend', status: 'ready' },
    { id: 'restore-essential', title: 'Restaurar funções essenciais primeiro', status: 'ready' },
    { id: 'validate-isolated', title: 'Validar módulos isolados', status: isolated.length ? 'pending' : 'not_needed' },
    { id: 'return-autonomy', title: 'Retornar autonomia em modo supervisionado', status: 'ready' }
  ], isolatedCount: isolated.length, generatedAt: new Date().toISOString() };
}
function recoverSystem(state = {}, payload = {}) {
  const now = new Date().toISOString();
  const protocol = buildRecoveryProtocol(state);
  const record = { id: `recovery-${Date.now()}`, protocol, requestedBy: payload.requestedBy || 'autonomy', status: 'progressive_recovery_started', createdAt: now };
  const nextState = { ...state, recoveryHistory: [record, ...(state.recoveryHistory || [])].slice(0, 60), crisis: { ...(state.crisis || {}), active: false, level: 'normal', updatedAt: now } };
  nextState.state = { ...(state.state || {}), mode: 'supervised_autonomy', riskLevel: 'medium', updatedAt: now };
  return { ok: true, recovery: record, state: nextState };
}
module.exports = { buildRecoveryProtocol, recoverSystem };
