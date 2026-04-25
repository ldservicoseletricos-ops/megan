function buildDiplomacyStatus(state = {}) {
  const negotiations = state.diplomacyHistory || [];
  const latest = negotiations[0] || null;
  return { ok: true, status: (latest && latest.status) || 'stable', activeNegotiation: latest, tensions: (state.coalitions || []).filter((item) => item.status === 'conflict').length, history: negotiations.slice(0, 10), generatedAt: new Date().toISOString() };
}
function negotiateDiplomacy(state = {}, payload = {}) {
  const participants = payload.participants || ['strategy-core', 'backend-stability'];
  const agreement = { id: `dip-${Date.now()}`, missionId: payload.missionId || null, participants, mediator: payload.mediator || 'consensus-engine', status: 'agreement', resolution: payload.resolution || 'cooperação parcial aprovada', trustGain: Number(payload.trustGain || 4), createdAt: new Date().toISOString() };
  state.diplomacyHistory = [agreement, ...(state.diplomacyHistory || [])].slice(0, 40);
  return { state, agreement, history: state.diplomacyHistory };
}
module.exports = { buildDiplomacyStatus, negotiateDiplomacy };
