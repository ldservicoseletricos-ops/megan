function buildCoalitions(state = {}) { return { ok: true, items: (state.coalitions || []).slice(0, 12), generatedAt: new Date().toISOString() }; }
function formCoalition(state = {}, payload = {}) {
  const entry = { id: `coal-${Date.now()}`, missionId: payload.missionId || (state.state && state.state.currentMissionId) || null, missionTitle: payload.missionTitle || (state.state && state.state.currentMission) || 'Missão coordenada', leader: payload.leader || 'strategy-core', support: payload.support || ['backend-stability', 'frontend-performance-master'], synergy: Number(payload.synergy || 88), status: 'active', createdAt: new Date().toISOString() };
  state.coalitions = [entry, ...(state.coalitions || [])].slice(0, 30);
  return { state, coalition: entry, items: state.coalitions };
}
module.exports = { buildCoalitions, formCoalition };
