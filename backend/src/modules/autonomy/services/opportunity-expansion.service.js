function buildOpportunities(state = {}) {
  const opportunities = state.externalOpportunities || [
    { id: 'ops-monitoring', title: 'Monitoramento externo de uptime', area: 'infra', expectedImpact: 86, effort: 34, risk: 22 },
    { id: 'crm-automation', title: 'Automação comercial via CRM', area: 'revenue', expectedImpact: 82, effort: 42, risk: 31 },
    { id: 'maps-traffic-provider', title: 'Fornecedor complementar de tráfego/mapas', area: 'navigation', expectedImpact: 78, effort: 55, risk: 48 },
    { id: 'support-knowledge-base', title: 'Base de conhecimento pública para suporte', area: 'support', expectedImpact: 74, effort: 28, risk: 18 },
  ];
  const ranked = opportunities.map((item) => ({ ...item, opportunityScore: Math.round((item.expectedImpact * 0.55) + ((100 - item.effort) * 0.25) + ((100 - item.risk) * 0.2)) })).sort((a, b) => b.opportunityScore - a.opportunityScore);
  return { ok: true, version: '3.5.0', items: ranked, bestOpportunity: ranked[0] || null, generatedAt: new Date().toISOString() };
}
module.exports = { buildOpportunities };
