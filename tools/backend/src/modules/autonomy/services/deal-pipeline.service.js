const { defaultLeads } = require('./smart-crm.service');
function buildPipeline(state = {}) {
  const leads = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const stages = ['new', 'discovery', 'qualified', 'proposal', 'closing'];
  const pipeline = stages.map((stage) => { const items = leads.filter((lead) => lead.stage === stage); return { stage, count: items.length, value: items.reduce((sum, lead) => sum + Number(lead.value || 0), 0), weighted: Math.round(items.reduce((sum, lead) => sum + Number(lead.value || 0) * Number(lead.probability || 0) / 100, 0)), items }; });
  return { ok: true, version: '3.8.0', pipeline, totalValue: pipeline.reduce((sum, stage) => sum + stage.value, 0), weightedValue: pipeline.reduce((sum, stage) => sum + stage.weighted, 0) };
}
module.exports = { buildPipeline };
