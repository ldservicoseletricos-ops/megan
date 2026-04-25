function buildGovernanceLedger(state = {}) {
  const history = state.governanceHistory || [];
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    items: history.slice(0, 20),
    summary: {
      total: history.length,
      approved: history.filter((item) => item.outcome === 'approved').length,
      escalated: history.filter((item) => item.outcome === 'escalated').length,
      blocked: history.filter((item) => item.outcome === 'blocked').length,
    },
  };
}

module.exports = { buildGovernanceLedger };
