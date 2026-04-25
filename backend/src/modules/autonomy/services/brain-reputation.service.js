function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function buildBrainReputations(state = {}) {
  const brains = Array.isArray(state.internalBrains) ? state.internalBrains : [];
  const performance = Array.isArray(state.brainPerformanceLedger) ? state.brainPerformanceLedger : [];
  return brains.map((brain) => {
    const perf = performance.find((item) => item.id === brain.id) || {};
    const reputation = Math.max(10, Math.min(100, Math.round((toNumber(brain.autonomyLevel, 60) * 0.3) + (toNumber(perf.meritScore, 55) * 0.45) + ((100 - toNumber(brain.load, 50)) * 0.15) + (toNumber(perf.successRate, 70) * 0.1))));
    const cost = Math.max(10, Math.min(100, Math.round((toNumber(brain.load, 50) * 0.55) + ((100 - toNumber(brain.autonomyLevel, 60)) * 0.25) + (100 - toNumber(perf.successRate, 70)) * 0.2)));
    return {
      id: brain.id,
      name: brain.name || brain.id,
      role: brain.role || 'generalist',
      status: brain.status || 'online',
      specialization: brain.specialization || brain.role || 'generalist',
      autonomyLevel: toNumber(brain.autonomyLevel, 60),
      load: toNumber(brain.load, 50),
      successRate: toNumber(perf.successRate, 72),
      meritScore: toNumber(perf.meritScore, 55),
      reputation,
      operationalCost: cost,
      availability: Math.max(0, 100 - toNumber(brain.load, 50)),
    };
  }).sort((a, b) => b.reputation - a.reputation);
}

module.exports = { buildBrainReputations };
