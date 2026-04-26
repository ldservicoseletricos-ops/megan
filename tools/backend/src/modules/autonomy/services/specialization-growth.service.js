function buildGrowthPlan(state = {}) {
  const generatedBrains = (state.internalBrains || []).filter((item) => item.generated);
  return {
    ok: true,
    items: [
      { id: 'growth-1', title: 'Fortalecer cérebro de deploy', progress: generatedBrains.some((b) => String(b.specialty || '').includes('deploy')) ? 72 : 28 },
      { id: 'growth-2', title: 'Expandir cobertura de auditoria', progress: (state.auditReports || []).length > 0 ? 64 : 18 },
      { id: 'growth-3', title: 'Adicionar especialistas por gargalo recorrente', progress: generatedBrains.length ? 58 : 14 },
    ],
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildGrowthPlan };
