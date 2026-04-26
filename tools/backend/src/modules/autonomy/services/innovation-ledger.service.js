function buildInnovationHistory(state = {}) {
  const history = state.innovationLedger || [];
  return { ok: true, count: history.length, items: history.slice(0, 50), generatedAt: new Date().toISOString() };
}
function appendInnovation(state = {}, entry = {}) {
  const item = { id: entry.id || `innovation-${Date.now()}`, type: entry.type || 'idea', title: entry.title || 'Inovação registrada', details: entry.details || entry, createdAt: new Date().toISOString() };
  return [item, ...(state.innovationLedger || [])].slice(0, 80);
}
module.exports = { buildInnovationHistory, appendInnovation };
