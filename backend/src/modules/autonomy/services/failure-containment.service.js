function buildContainmentPlan(state = {}, payload = {}) {
  const moduleName = payload.module || payload.source || 'autonomy';
  const severity = payload.severity || 'high';
  const actions = [
    { id: 'freeze-risky-actions', title: 'Congelar ações de risco', status: 'ready' },
    { id: 'protect-core-routes', title: 'Proteger rotas essenciais', status: 'ready' },
    { id: 'route-to-supervision', title: 'Enviar decisões críticas para supervisão', status: 'ready' }
  ];
  if (['critical', 'high'].includes(severity)) actions.push({ id: 'quarantine-module', title: `Isolar módulo ${moduleName}`, status: 'ready' });
  return { ok: true, module: moduleName, severity, actions, containmentScore: severity === 'critical' ? 96 : 84, generatedAt: new Date().toISOString() };
}
function containFailure(state = {}, payload = {}) {
  const now = new Date().toISOString();
  const plan = buildContainmentPlan(state, payload);
  const entry = { id: `contain-${Date.now()}`, ...plan, status: 'applied', appliedAt: now };
  const nextState = { ...state, containmentHistory: [entry, ...(state.containmentHistory || [])].slice(0, 60) };
  nextState.state = { ...(state.state || {}), riskLevel: payload.severity || 'high', updatedAt: now };
  return { ok: true, containment: entry, state: nextState };
}
module.exports = { buildContainmentPlan, containFailure };
