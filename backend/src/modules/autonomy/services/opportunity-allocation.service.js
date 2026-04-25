function buildOpportunityAllocation(state = {}) {
  const items = Array.isArray(state.marketAllocations) ? state.marketAllocations : [];
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    items,
    latest: items[0] || null,
  };
}

module.exports = { buildOpportunityAllocation };
