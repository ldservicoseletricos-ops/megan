function buildCommandDashboard(companies = [], units = []) {
  const activeUnits = units.filter(u=>u.status==='active');
  const ranked = [...units].sort((a,b)=>Number(b.performance||0)-Number(a.performance||0));
  return { ok: true, version: '3.9.0', command: { mode: 'centralized_enterprise_command', readiness: 88, criticalAlerts: [
    { level: 'medium', title: 'Padronizar indicadores por unidade', action: 'Criar score único para operação multiempresa' },
    { level: 'low', title: 'Replicar prática da unidade mais eficiente', action: 'Aplicar playbook do Core Platform nas demais unidades' }
  ], nextDecision: 'Priorizar unidade com maior impacto e menor risco operacional' }, companies: { total: companies.length, active: companies.filter(c=>c.status==='active').length }, units: { total: units.length, active: activeUnits.length, topPerformer: ranked[0] || null, watchlist: ranked.filter(u=>Number(u.performance||0)<78) } };
}
module.exports = { buildCommandDashboard };
