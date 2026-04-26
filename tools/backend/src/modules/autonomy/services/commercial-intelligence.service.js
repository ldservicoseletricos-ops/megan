const { buildVendorRanking } = require('./vendor-ranking.service');
function evaluateVendor(payload = {}, state = {}) {
  const ranking = buildVendorRanking(state);
  const vendor = payload.vendor || ranking.bestVendor || { id: 'custom', name: payload.name || 'Fornecedor externo', monthlyCost: payload.monthlyCost || 30, reliability: 80, scalability: 78, lockInRisk: 40, integrationFit: 82 };
  const roiScore = Math.round(((vendor.reliability || 75) * 0.22) + ((vendor.scalability || 75) * 0.2) + ((vendor.integrationFit || 75) * 0.24) + ((100 - (vendor.lockInRisk || 50)) * 0.14) + ((payload.expectedRevenueLift || 60) * 0.2));
  const riskLevel = (vendor.lockInRisk || 0) >= 65 ? 'high' : roiScore >= 82 ? 'low' : 'medium';
  return { ok: true, version: '3.5.0', vendor, roiScore, riskLevel, decision: roiScore >= 82 && riskLevel !== 'high' ? 'negotiate_or_adopt' : roiScore >= 70 ? 'negotiate_better_terms' : 'avoid_for_now', notes: ['Comparar custo mensal com impacto operacional.', 'Evitar dependência externa sem plano de saída.', 'Validar integração antes de contrato longo.'], generatedAt: new Date().toISOString() };
}
function buildCommercialDashboard(state = {}) {
  const ranking = buildVendorRanking(state);
  return { ok: true, version: '3.5.0', vendorRanking: ranking.items, portfolioScore: Math.round(ranking.items.reduce((sum, item) => sum + item.valueScore, 0) / (ranking.items.length || 1)), priorities: ['reduzir custo de infraestrutura', 'aumentar confiabilidade do deploy', 'priorizar fornecedores com API clara'], generatedAt: new Date().toISOString() };
}
module.exports = { evaluateVendor, buildCommercialDashboard };
