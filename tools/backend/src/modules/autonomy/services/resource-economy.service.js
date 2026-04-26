function buildResourceStatus(state = {}) {
  const brains = [ ...(state.internalBrains || []), ...(state.generatedBrains || []) ];
  const normalized = (brains.length ? brains : [
    { id: 'strategic', name: 'strategic', role: 'strategy', status: 'online', load: 54, autonomyLevel: 82 },
    { id: 'operational', name: 'operational', role: 'operations', status: 'online', load: 63, autonomyLevel: 88 },
    { id: 'technical', name: 'technical', role: 'engineering', status: 'online', load: 58, autonomyLevel: 84 },
  ]).map((brain, index) => {
    const load = Number(brain.load || 35 + index * 8);
    const merit = Number(brain.meritScore || brain.score || 65);
    const efficiency = Math.max(45, Math.min(98, Math.round(((Number(brain.autonomyLevel || 75) * 0.45) + (merit * 0.3) + ((100 - load) * 0.25)))));
    return {
      id: brain.id || `brain-${index + 1}`,
      name: brain.name || brain.id || `Brain ${index + 1}`,
      role: brain.role || brain.specialization || 'generalist',
      status: brain.status || 'online',
      load,
      merit,
      efficiency,
    };
  });
  const totalUnits = Number((state.resourceBudget || {}).totalUnits || 100);
  const totalWeight = normalized.reduce((acc, item) => acc + item.efficiency + (100 - item.load), 0) || 1;
  const items = normalized.map((item) => ({
    id: item.id,
    name: item.name,
    role: item.role,
    status: item.status,
    load: item.load,
    efficiency: item.efficiency,
    allocationUnits: Math.max(5, Math.round((((item.efficiency + (100 - item.load)) / totalWeight) * totalUnits))),
  })).sort((a,b)=>b.allocationUnits-a.allocationUnits);
  return {
    ok: true,
    score: Math.round(items.reduce((acc, item) => acc + item.efficiency, 0) / items.length),
    totalUnits,
    utilizedUnits: items.reduce((acc, item) => acc + item.allocationUnits, 0),
    availableUnits: Math.max(0, totalUnits - items.reduce((acc, item) => acc + item.allocationUnits, 0)),
    activeBrains: items.filter((item) => item.status === 'online').length,
    idleBrains: items.filter((item) => item.status !== 'online').length,
    items,
    updatedAt: new Date().toISOString(),
  };
}
module.exports = { buildResourceStatus };
