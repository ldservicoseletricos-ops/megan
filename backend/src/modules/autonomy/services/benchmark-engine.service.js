function buildEnterpriseBenchmark(companies = [], units = []) {
  const unitBenchmarks = units.map(u => ({ id: u.id, name: u.name, performance: Number(u.performance||0), workload: Number(u.workload||0), efficiency: Math.max(1, Math.round(Number(u.performance||0) - Number(u.workload||0) * 0.18)), recommendation: Number(u.performance||0) >= 85 ? 'replicar práticas' : Number(u.workload||0) > 70 ? 'reduzir sobrecarga' : 'acompanhar evolução' })).sort((a,b)=>b.efficiency-a.efficiency);
  const companyBenchmarks = companies.map(c => ({ id: c.id, name: c.name, healthScore: Number(c.healthScore||0), riskLevel: c.riskLevel || 'medium', status: Number(c.healthScore||0) >= 85 ? 'strong' : Number(c.healthScore||0) >= 75 ? 'stable' : 'attention' })).sort((a,b)=>b.healthScore-a.healthScore);
  return { ok: true, version: '3.9.0', companyBenchmarks, unitBenchmarks, bestPracticeSource: unitBenchmarks[0] || null };
}
module.exports = { buildEnterpriseBenchmark };
