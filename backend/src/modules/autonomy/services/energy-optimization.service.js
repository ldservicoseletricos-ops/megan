function buildEnergyStatus(state = {}) {
  const brains = [ ...(state.internalBrains || []), ...(state.generatedBrains || []) ];
  const activeBrains = brains.filter((brain) => (brain.status || 'online') === 'online').length || 3;
  const standbyBrains = brains.filter((brain) => ['standby','idle'].includes(String(brain.status || '').toLowerCase())).length;
  const retiredBrains = brains.filter((brain) => ['retired','archived'].includes(String(brain.status || '').toLowerCase())).length;
  const energyConsumption = Math.max(30, Math.min(95, 30 + activeBrains * 11 + standbyBrains * 3));
  return {
    ok: true,
    activeBrains,
    standbyBrains,
    retiredBrains,
    energyConsumption,
    optimizationPotential: Math.max(8, Math.min(40, standbyBrains * 6 + Math.max(0, 5 - activeBrains) * 5)),
    status: energyConsumption > 80 ? 'high_load' : energyConsumption > 60 ? 'elevated' : 'efficient',
    updatedAt: new Date().toISOString(),
  };
}
function optimizeEnergy(state = {}) {
  const now = new Date().toISOString();
  state.generatedBrains = (state.generatedBrains || []).map((brain, index) => {
    if ((brain.status || 'online') === 'online' && Number(brain.load || 0) < 25 && index % 2 === 0) return { ...brain, status: 'standby', updatedAt: now };
    return brain;
  });
  state.energyOptimizationHistory = [{ id: `energy-${Date.now()}`, action: 'optimize_energy', createdAt: now }, ...(state.energyOptimizationHistory || [])].slice(0, 20);
  const energy = buildEnergyStatus(state);
  state.energyStatus = energy;
  return { state, energy, history: state.energyOptimizationHistory };
}
module.exports = { buildEnergyStatus, optimizeEnergy };
