function defaultLeads() {
  return [
    { id: 'lead-enterprise-001', name: 'Empresa Premium Local', company: 'Operação Comercial', stage: 'qualified', value: 18900, probability: 78, priority: 'high', nextAction: 'Enviar proposta Megan OS Enterprise', owner: 'sales-operator', lastContact: 'hoje', source: 'pipeline interno' },
    { id: 'lead-clinic-002', name: 'Clínica Inteligente', company: 'Saúde e Agenda', stage: 'proposal', value: 12600, probability: 71, priority: 'high', nextAction: 'Demonstrar painel saúde + CRM', owner: 'crm-brain', lastContact: 'ontem', source: 'indicação' },
    { id: 'lead-services-003', name: 'Serviços Elétricos Pro', company: 'Manutenção e Rotas', stage: 'discovery', value: 8400, probability: 63, priority: 'medium', nextAction: 'Mapear dores operacionais', owner: 'growth-engine', lastContact: '3 dias', source: 'site' }
  ];
}
function normalizeLead(payload = {}) {
  const value = Number(payload.value || payload.estimatedValue || 5000);
  const probability = Math.max(10, Math.min(95, Number(payload.probability || 58)));
  return { id: payload.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name: payload.name || payload.contact || 'Novo lead Megan', company: payload.company || 'Empresa não informada', stage: payload.stage || 'new', value, probability, priority: probability >= 75 || value >= 12000 ? 'high' : probability >= 55 ? 'medium' : 'low', nextAction: payload.nextAction || 'Qualificar necessidade e agendar conversa', owner: payload.owner || 'sales-operator', lastContact: payload.lastContact || 'agora', source: payload.source || 'manual' };
}
function listLeads(state = {}) {
  const saved = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const totalPipeline = saved.reduce((sum, lead) => sum + Number(lead.value || 0), 0);
  const weightedPipeline = saved.reduce((sum, lead) => sum + (Number(lead.value || 0) * Number(lead.probability || 0) / 100), 0);
  return { ok: true, version: '3.8.0', total: saved.length, totalPipeline, weightedPipeline: Math.round(weightedPipeline), leads: saved };
}
function addLead(state = {}, payload = {}) {
  const lead = normalizeLead(payload);
  const leads = [lead, ...((state.crmLeads && state.crmLeads.length ? state.crmLeads : defaultLeads()))].slice(0, 60);
  return { ok: true, version: '3.8.0', lead, leads, summary: { total: leads.length, weightedPipeline: Math.round(leads.reduce((sum, item) => sum + (Number(item.value || 0) * Number(item.probability || 0) / 100), 0)) } };
}
module.exports = { defaultLeads, normalizeLead, listLeads, addLead };
