const { defaultLeads } = require('./smart-crm.service');
function buildConversionIntelligence(state = {}) {
  const leads = Array.isArray(state.crmLeads) && state.crmLeads.length ? state.crmLeads : defaultLeads();
  const scored = leads.map((lead) => { const valueScore = Math.min(25, Number(lead.value || 0) / 800); const probabilityScore = Number(lead.probability || 0) * 0.55; const stageScore = { new: 6, discovery: 12, qualified: 18, proposal: 24, closing: 30 }[lead.stage] || 10; const score = Math.round(Math.min(100, valueScore + probabilityScore + stageScore)); return { ...lead, conversionScore: score, riskOfLoss: score < 55 ? 'high' : score < 74 ? 'medium' : 'low', recommendedMove: score >= 78 ? 'fechar proposta agora' : score >= 60 ? 'reforçar valor e objeções' : 'qualificar dor antes da oferta' }; }).sort((a,b)=>b.conversionScore-a.conversionScore);
  const averageScore = Math.round(scored.reduce((sum, lead) => sum + lead.conversionScore, 0) / Math.max(1, scored.length));
  return { ok: true, version: '3.8.0', averageScore, topLead: scored[0] || null, leads: scored };
}
module.exports = { buildConversionIntelligence };
