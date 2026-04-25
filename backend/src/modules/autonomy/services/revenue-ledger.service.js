const { defaultLeads } = require('./smart-crm.service');
function buildRevenueLedger(state = {}) {
  const leads = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const forecast = leads.map((lead) => ({ id: `revenue-${lead.id}`, lead: lead.name, expected: Math.round(Number(lead.value || 0) * Number(lead.probability || 0) / 100), gross: Number(lead.value || 0), probability: lead.probability, period: lead.stage === 'proposal' || lead.stage === 'closing' ? '30 dias' : '60-90 dias' }));
  return { ok: true, version: '3.8.0', forecast, expectedRevenue: forecast.reduce((sum, item) => sum + item.expected, 0), grossPipeline: forecast.reduce((sum, item) => sum + item.gross, 0), generatedAt: new Date().toISOString() };
}
module.exports = { buildRevenueLedger };
