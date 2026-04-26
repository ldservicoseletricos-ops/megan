function buildIsolationStatus(state = {}) {
  const isolated = state.isolatedModules || [];
  return { ok: true, isolatedModules: isolated, essentialModules: ['auth', 'health', 'autonomy', 'rollback'], policy: 'Isolar somente módulos instáveis, preservando funções essenciais.', generatedAt: new Date().toISOString() };
}
function isolateModule(state = {}, payload = {}) {
  const now = new Date().toISOString();
  const moduleName = payload.module || payload.source || 'unknown-module';
  const record = { id: `iso-${Date.now()}`, module: moduleName, reason: payload.reason || 'Falha ou risco detectado.', status: 'isolated', createdAt: now };
  const current = state.isolatedModules || [];
  const nextState = { ...state, isolatedModules: [record, ...current.filter((item) => item.module !== moduleName)].slice(0, 30) };
  nextState.state = { ...(state.state || {}), updatedAt: now };
  return { ok: true, isolation: record, status: buildIsolationStatus(nextState), state: nextState };
}
module.exports = { buildIsolationStatus, isolateModule };
