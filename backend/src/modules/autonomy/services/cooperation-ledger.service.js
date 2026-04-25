function buildCooperationLedger(state = {}) {
  const items = []
    .concat((state.alliances || []).map((item) => ({ id: `${item.id}-ledger`, type: 'alliance', title: item.name, status: item.status, synergy: item.synergy, createdAt: item.createdAt })))
    .concat((state.diplomacyHistory || []).map((item) => ({ id: `${item.id}-ledger`, type: 'diplomacy', title: item.resolution, status: item.status, synergy: 70 + Number(item.trustGain || 0), createdAt: item.createdAt })))
    .concat((state.coalitions || []).map((item) => ({ id: `${item.id}-ledger`, type: 'coalition', title: item.missionTitle, status: item.status, synergy: item.synergy, createdAt: item.createdAt })))
    .sort((a,b)=> (b.createdAt||'').localeCompare(a.createdAt||''));
  return { ok: true, items: items.slice(0, 20), generatedAt: new Date().toISOString() };
}
module.exports = { buildCooperationLedger };
