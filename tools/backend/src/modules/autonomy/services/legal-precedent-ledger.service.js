function buildLegalPrecedentLedger(state = {}) {
  const tribunalHistory = state.tribunalHistory || [];
  const governanceHistory = state.governanceHistory || [];
  const precedents = [
    ...tribunalHistory.map((item) => ({ id: item.id, source: 'tribunal', title: item.title, outcome: item.verdict, createdAt: item.createdAt })),
    ...governanceHistory.slice(0, 10).map((item) => ({ id: item.id, source: 'governance', title: `Voto contextual: ${item.context}`, outcome: item.outcome, createdAt: item.createdAt })),
  ];
  return { ok: true, items: precedents.slice(0, 30), total: precedents.length, generatedAt: new Date().toISOString() };
}

module.exports = { buildLegalPrecedentLedger };
