const { buildBrainReputations } = require('./brain-reputation.service');

function scoreBid(mission, brain) {
  const priorityWeight = { critical: 28, high: 20, medium: 12, low: 6 }[mission.priority] || 10;
  const fitBonus = (brain.specialization || '').includes((mission.owner || '').split('-')[0]) ? 10 : 0;
  const confidence = Math.max(20, Math.round((brain.reputation * 0.55) + (brain.successRate * 0.25) + (brain.availability * 0.2) + fitBonus));
  const effort = Math.max(1, Math.round((100 - brain.availability) * 0.15 + brain.operationalCost * 0.4 + (100 - brain.meritScore) * 0.08 + priorityWeight * 0.12));
  const value = Math.max(10, Math.round((confidence * 0.7) - (effort * 0.35) + priorityWeight));
  return {
    brainId: brain.id,
    brainName: brain.name,
    confidence,
    effort,
    value,
    estimatedCycles: Math.max(1, Math.round((effort / 12))),
  };
}

function buildAuctions(state = {}) {
  const reputations = buildBrainReputations(state);
  const missions = (Array.isArray(state.missions) ? state.missions : []).filter((mission) => mission.status !== 'done').slice(0, 5);
  const items = missions.map((mission) => {
    const bids = reputations.slice(0, 6).map((brain) => scoreBid(mission, brain)).sort((a, b) => b.value - a.value);
    return {
      id: `auction-${mission.id}`,
      missionId: mission.id,
      title: mission.title,
      priority: mission.priority || 'medium',
      status: mission.status || 'queued',
      bids,
      winner: bids[0] || null,
      supports: bids.slice(1, 3),
      generatedAt: new Date().toISOString(),
    };
  });
  return { ok: true, generatedAt: new Date().toISOString(), items };
}

function runAuction(state = {}, payload = {}) {
  const auctions = buildAuctions(state).items;
  const target = auctions.find((item) => item.missionId === payload.missionId) || auctions[0] || null;
  if (!target) return { state, allocation: null, auctions };
  const allocation = {
    id: `alloc-${target.missionId}`,
    missionId: target.missionId,
    missionTitle: target.title,
    winner: target.winner,
    supports: target.supports,
    status: 'allocated',
    allocatedAt: new Date().toISOString(),
  };
  const history = Array.isArray(state.marketAllocations) ? state.marketAllocations : [];
  return {
    state: { ...state, marketAllocations: [allocation, ...history].slice(0, 25) },
    allocation,
    auctions,
  };
}

module.exports = { buildAuctions, runAuction };
