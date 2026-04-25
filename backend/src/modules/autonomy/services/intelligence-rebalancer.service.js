function rebalanceIntelligence(state = {}, ranking = []) {
  const leader = ranking[0] || null;
  const support = ranking.slice(1, 4);
  state.intelligenceRebalance = {
    leader: leader ? { id: leader.id, name: leader.name, meritScore: leader.meritScore } : null,
    support: support.map((item) => ({ id: item.id, name: item.name, meritScore: item.meritScore })),
    generatedAt: new Date().toISOString(),
    status: leader ? 'rebalanced' : 'idle',
  };
  return { ok: true, plan: state.intelligenceRebalance, state };
}

module.exports = { rebalanceIntelligence };
