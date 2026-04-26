const DEFAULT_COMPANIES = [
  { id: 'company-megan-os', name: 'Megan OS', segment: 'AI SaaS', status: 'active', healthScore: 91, revenueFocus: 'autonomy subscriptions', riskLevel: 'medium' },
  { id: 'company-ld-services', name: 'LD Serviços Elétricos', segment: 'field services', status: 'active', healthScore: 84, revenueFocus: 'service operations', riskLevel: 'low' },
  { id: 'company-digital-products', name: 'Digital Products Studio', segment: 'KDP and digital content', status: 'planning', healthScore: 76, revenueFocus: 'content pipeline', riskLevel: 'medium' }
];
function getCompanies(state = {}) {
  const companies = state.companies || DEFAULT_COMPANIES;
  return { ok: true, version: '3.9.0', companies, summary: { total: companies.length, active: companies.filter(c => c.status === 'active').length } };
}
function addCompany(state = {}, payload = {}) {
  const company = { id: payload.id || `company-${Date.now()}`, name: payload.name || 'Nova empresa', segment: payload.segment || 'general', status: payload.status || 'planning', healthScore: Number(payload.healthScore || 72), revenueFocus: payload.revenueFocus || 'growth', riskLevel: payload.riskLevel || 'medium', createdAt: new Date().toISOString() };
  return { ok: true, company };
}
module.exports = { getCompanies, addCompany, DEFAULT_COMPANIES };
