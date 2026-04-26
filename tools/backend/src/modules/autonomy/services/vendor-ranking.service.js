function buildVendorRanking(state = {}) {
  const vendors = state.externalVendors || [
    { id: 'render', name: 'Render', category: 'backend_hosting', monthlyCost: 25, reliability: 88, scalability: 82, lockInRisk: 34, integrationFit: 91 },
    { id: 'vercel', name: 'Vercel', category: 'frontend_hosting', monthlyCost: 20, reliability: 92, scalability: 90, lockInRisk: 39, integrationFit: 94 },
    { id: 'supabase', name: 'Supabase', category: 'database_auth', monthlyCost: 25, reliability: 86, scalability: 84, lockInRisk: 46, integrationFit: 89 },
    { id: 'cloudflare', name: 'Cloudflare', category: 'edge_security', monthlyCost: 20, reliability: 94, scalability: 95, lockInRisk: 28, integrationFit: 87 },
  ];
  const ranked = vendors.map((vendor) => {
    const valueScore = Math.round(((vendor.reliability || 70) * 0.28) + ((vendor.scalability || 70) * 0.24) + ((vendor.integrationFit || 70) * 0.28) + ((100 - (vendor.lockInRisk || 50)) * 0.12) + ((100 - Math.min(vendor.monthlyCost || 0, 100)) * 0.08));
    return { ...vendor, valueScore, recommendation: valueScore >= 85 ? 'preferred' : valueScore >= 75 ? 'viable' : 'monitor' };
  }).sort((a, b) => b.valueScore - a.valueScore);
  return { ok: true, version: '3.5.0', items: ranked, bestVendor: ranked[0] || null, generatedAt: new Date().toISOString() };
}
module.exports = { buildVendorRanking };
