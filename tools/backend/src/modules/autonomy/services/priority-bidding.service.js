function missionBid(mission) {
  const urgency = { critical: 95, high: 78, medium: 56, low: 32 }[mission.priority] || 45;
  const progress = Number(mission.progress || 0);
  const blockerRelief = Math.max(10, 90 - progress);
  const returnScore = Math.max(12, Math.round((urgency * 0.45) + (blockerRelief * 0.35) + ((mission.status === 'active' ? 12 : 0)) + ((mission.status === 'queued' ? 8 : 0))));
  return {
    missionId: mission.id,
    title: mission.title,
    urgency,
    blockerRelief,
    returnScore,
    bidScore: Math.round((urgency * 0.5) + (blockerRelief * 0.3) + (returnScore * 0.2)),
    priority: mission.priority || 'medium',
  };
}

function buildPriorityBids(state = {}) {
  const items = (Array.isArray(state.missions) ? state.missions : [])
    .filter((mission) => mission.status !== 'done')
    .map(missionBid)
    .sort((a, b) => b.bidScore - a.bidScore);
  return { ok: true, generatedAt: new Date().toISOString(), items, winner: items[0] || null };
}

function recalculatePriorityBids(state = {}) {
  const bids = buildPriorityBids(state);
  return { state: { ...state, priorityBidding: bids.items }, bids };
}

module.exports = { buildPriorityBids, recalculatePriorityBids };
