function buildCrisisStatus(state = {}) {
  const crisis = state.crisis || {};
  const activeIncidents = (state.incidents || []).filter((item) => item.status !== 'resolved');
  const isActive = Boolean(crisis.active) || activeIncidents.some((item) => item.severity === 'critical');
  return {
    ok: true,
    active: isActive,
    level: isActive ? (crisis.level || 'elevated') : 'normal',
    mode: isActive ? 'crisis_containment' : 'normal_operation',
    protectedFunctions: ['auth', 'health', 'autonomy-status', 'rollback', 'audit'],
    restrictedFunctions: isActive ? ['auto-deploy', 'destructive-patch', 'billing-change', 'credential-change'] : [],
    incidentCount: activeIncidents.length,
    startedAt: crisis.startedAt || null,
    updatedAt: crisis.updatedAt || new Date().toISOString()
  };
}
function triggerCrisis(state = {}, payload = {}) {
  const now = new Date().toISOString();
  const level = payload.level || (payload.severity === 'critical' ? 'critical' : 'elevated');
  const incident = { id: `incident-${Date.now()}`, title: payload.title || 'Crise operacional detectada', module: payload.module || payload.source || 'autonomy', severity: payload.severity || 'high', status: 'contained_pending_review', reason: payload.reason || 'Acionamento manual ou automático do modo crise.', createdAt: now };
  const nextState = { ...state, incidents: [incident, ...(state.incidents || [])].slice(0, 80), crisis: { active: true, level, startedAt: state.crisis?.startedAt || now, updatedAt: now, lastIncidentId: incident.id } };
  nextState.state = { ...(state.state || {}), mode: 'crisis_containment', riskLevel: level, updatedAt: now };
  return { ok: true, crisis: buildCrisisStatus(nextState), incident, state: nextState };
}
module.exports = { buildCrisisStatus, triggerCrisis };
