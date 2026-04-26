const DEFAULT_UNITS = [
  { id: 'unit-core', companyId: 'company-megan-os', name: 'Core Platform', region: 'cloud', status: 'active', performance: 92, workload: 68 },
  { id: 'unit-sales', companyId: 'company-megan-os', name: 'Commercial Engine', region: 'online', status: 'active', performance: 81, workload: 57 },
  { id: 'unit-field-sp', companyId: 'company-ld-services', name: 'São Paulo Operations', region: 'SP', status: 'active', performance: 86, workload: 74 },
  { id: 'unit-content', companyId: 'company-digital-products', name: 'Content Production', region: 'remote', status: 'planning', performance: 73, workload: 49 }
];
function getUnits(state = {}) {
  const units = state.units || DEFAULT_UNITS;
  return { ok: true, version: '3.9.0', units, summary: { total: units.length, active: units.filter(u => u.status === 'active').length, averagePerformance: Math.round(units.reduce((a,u)=>a+Number(u.performance||0),0)/Math.max(1,units.length)) } };
}
function addUnit(state = {}, payload = {}) {
  const unit = { id: payload.id || `unit-${Date.now()}`, companyId: payload.companyId || 'company-megan-os', name: payload.name || 'Nova unidade', region: payload.region || 'online', status: payload.status || 'planning', performance: Number(payload.performance || 70), workload: Number(payload.workload || 45), createdAt: new Date().toISOString() };
  return { ok: true, unit };
}
module.exports = { getUnits, addUnit, DEFAULT_UNITS };
