function appendExecutiveLedger(state = {}, entry = {}) {
  const item = { id: entry.id || `exec-${Date.now()}`, type: entry.type || 'executive_event', title: entry.title || 'Evento executivo registrado', summary: entry.summary || 'Megan registrou uma decisão executiva.', impact: entry.impact || 'medium', createdAt: new Date().toISOString() };
  const history = [item, ...(state.executiveLedger || [])].slice(0, 50);
  return { item, history };
}
function buildExecutiveLedger(state = {}) { return { ok: true, items: state.executiveLedger || [], summary: { total: (state.executiveLedger || []).length, last: (state.executiveLedger || [])[0] || null } }; }
module.exports = { appendExecutiveLedger, buildExecutiveLedger };
