const { defaultLeads } = require('./smart-crm.service');
function buildFollowupPlan(state = {}, payload = {}) {
  const leads = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const selected = payload.leadId ? leads.find((lead) => lead.id === payload.leadId) : leads.sort((a,b)=> (b.probability*b.value)-(a.probability*a.value))[0];
  const lead = selected || leads[0];
  const action = { id: `followup-${Date.now()}`, leadId: lead.id, title: payload.title || `Follow-up com ${lead.name}`, channel: payload.channel || (lead.stage === 'proposal' ? 'whatsapp + email' : 'whatsapp'), message: payload.message || `Olá, ${lead.name}. A Megan OS pode organizar seu fluxo com painel, automação e prioridade comercial. Posso te mostrar o próximo passo?`, priority: lead.priority, expectedLift: lead.priority === 'high' ? 9 : 5, due: payload.due || 'próximas 24h', status: 'planned' };
  return { ok: true, version: '3.8.0', action, selectedLead: lead, recommendation: 'Executar follow-up curto, direto e com proposta de valor clara.' };
}
function buildSalesNextActions(state = {}) {
  const leads = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const actions = leads.sort((a,b)=> (b.probability*b.value)-(a.probability*a.value)).slice(0,5).map((lead, index) => ({ id: `sales-action-${index+1}`, leadId: lead.id, lead: lead.name, action: lead.nextAction, priority: lead.priority, reason: `Valor ${lead.value} com ${lead.probability}% de chance.` }));
  return { ok: true, version: '3.8.0', actions };
}
module.exports = { buildFollowupPlan, buildSalesNextActions };
