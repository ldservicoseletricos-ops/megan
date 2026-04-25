function synthesizeSolution(ideas = [], payload = {}) {
  const selected = ideas.slice(0, 3);
  const avgImpact = selected.length ? Math.round(selected.reduce((s,i)=>s+i.impact,0)/selected.length) : 70;
  const avgRisk = selected.length ? Math.round(selected.reduce((s,i)=>s+i.risk,0)/selected.length) : 30;
  const plan = {
    id: `synthesis-${Date.now()}`,
    title: payload.title || 'Plano híbrido de evolução segura',
    strategy: 'combinar impacto alto, risco controlado e execução incremental',
    ingredients: selected.map(i => ({ id: i.id, title: i.title, area: i.area })),
    expectedImpact: Math.min(100, avgImpact + 6),
    estimatedRisk: Math.max(5, avgRisk - 4),
    phases: [
      'Mapear dependências e escopo seguro',
      'Aplicar mudança em camada isolada',
      'Validar API, build e experiência visual',
      'Registrar aprendizado no ledger de inovação',
    ],
    recommendation: avgRisk < 45 ? 'approved_for_supervised_execution' : 'requires_extra_validation',
    createdAt: new Date().toISOString(),
  };
  return { ok: true, synthesis: plan };
}
module.exports = { synthesizeSolution };
