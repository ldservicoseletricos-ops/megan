function buildAlliances(state = {}) {
  const brains = state.brains || [];
  const ranking = (state.brainRanking || []).length ? state.brainRanking : brains.map((brain, index) => ({ ...brain, rank: index + 1, score: Number(brain.score || 60) }));
  const items = ranking.slice(0, 6).reduce((acc, brain, index, arr) => {
    const partner = arr[index + 1];
    if (!partner || brain.domain === partner.domain) return acc;
    acc.push({ id: `alliance-${brain.id}-${partner.id}`, name: `${brain.name} + ${partner.name}`, leader: brain.id, members: [brain.id, partner.id], synergy: Math.min(99, Math.round((Number(brain.score || 60) + Number(partner.score || 60)) / 2 + 8)), status: 'proposed', missionFit: [brain.domain, partner.domain].filter(Boolean).join(' + ') });
    return acc;
  }, []);
  return { ok: true, items: items.slice(0, 4), generatedAt: new Date().toISOString() };
}
function createAlliance(state = {}, payload = {}) {
  const entry = { id: payload.id || `alliance-${Date.now()}`, name: payload.name || 'Coalizão Estratégica', leader: payload.leader || (payload.members && payload.members[0]) || 'strategy-core', members: payload.members || ['strategy-core', 'backend-stability'], synergy: Number(payload.synergy || 84), status: 'active', missionId: payload.missionId || null, createdAt: new Date().toISOString() };
  state.alliances = [entry, ...(state.alliances || [])].slice(0, 20);
  return { state, alliance: entry, items: state.alliances };
}
module.exports = { buildAlliances, createAlliance };
