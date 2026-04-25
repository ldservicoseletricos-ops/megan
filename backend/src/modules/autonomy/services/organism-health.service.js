function buildOrganismHealth(state = {}) {
  const crisis = state.crisisMode?.active === true;
  const incidents = (state.incidents || []).filter((item) => item.status !== 'resolved').length;
  const approvals = (state.approvals || []).filter((item) => item.status === 'pending').length;
  const score = Math.max(35, (crisis ? 68 : 91) - incidents * 4 - approvals * 2);
  return { ok: true, score, status: score >= 85 ? 'healthy' : score >= 70 ? 'attention' : 'critical', matrix: [
    { module: 'Autonomy Core', score: Math.min(98, score + 3), status: 'online' },
    { module: 'Governança', score: 90, status: 'online' },
    { module: 'Cérebros internos', score: 88, status: 'online' },
    { module: 'Economia cognitiva', score: 86, status: 'online' },
    { module: 'Modo crise', score: crisis ? 79 : 94, status: crisis ? 'active' : 'standby' },
    { module: 'Evolução supervisionada', score: 87, status: 'guarded' }
  ], blockers: incidents ? ['há incidentes abertos para revisar'] : [], generatedAt: new Date().toISOString() };
}
module.exports = { buildOrganismHealth };
