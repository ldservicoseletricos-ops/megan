function buildIncidentLedger(state = {}) {
  const incidents = state.incidents || [];
  const containment = state.containmentHistory || [];
  const recovery = state.recoveryHistory || [];
  return { ok: true, incidents: incidents.slice(0, 50), containment: containment.slice(0, 30), recovery: recovery.slice(0, 30), summary: { totalIncidents: incidents.length, openIncidents: incidents.filter((item) => item.status !== 'resolved').length, criticalIncidents: incidents.filter((item) => item.severity === 'critical').length, recoveries: recovery.length }, generatedAt: new Date().toISOString() };
}
module.exports = { buildIncidentLedger };
