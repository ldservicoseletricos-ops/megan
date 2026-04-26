const { buildBrainReputations } = require('./brain-reputation.service');

function buildInternalMarketStatus(state = {}) {
  const reputations = buildBrainReputations(state);
  const totalLiquidity = reputations.reduce((acc, item) => acc + Math.max(5, Math.round((item.reputation - item.operationalCost + 100) / 4)), 0);
  const attentionUnits = reputations.reduce((acc, item) => acc + Math.max(1, Math.round(item.availability / 10)), 0);
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    liquidity: totalLiquidity,
    attentionUnits,
    priceIndex: reputations.length ? Math.round(reputations.reduce((acc, item) => acc + (item.reputation - item.operationalCost), 0) / reputations.length) : 0,
    items: reputations.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      reputation: item.reputation,
      operationalCost: item.operationalCost,
      availability: item.availability,
      askPrice: Math.max(8, Math.round((item.operationalCost * 0.55) + ((100 - item.availability) * 0.2) + 8)),
      bidStrength: Math.max(10, Math.round((item.reputation * 0.65) + (item.availability * 0.2) - (item.operationalCost * 0.15))),
    })),
  };
}

module.exports = { buildInternalMarketStatus };
