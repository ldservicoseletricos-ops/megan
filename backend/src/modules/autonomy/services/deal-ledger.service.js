function buildDealLedger(state = {}) {
  const deals = state.deals || [];
  const summary = { total: deals.length, drafted: deals.filter((d) => d.status === 'drafted').length, approved: deals.filter((d) => d.status === 'approved').length, rejected: deals.filter((d) => d.status === 'rejected').length };
  return { ok: true, version: '3.5.0', summary, items: deals.slice(0, 25), generatedAt: new Date().toISOString() };
}
module.exports = { buildDealLedger };
