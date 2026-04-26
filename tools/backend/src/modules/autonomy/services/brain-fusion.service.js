function overlapScore(a = '', b = '') {
  const as = new Set(String(a).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  const bs = new Set(String(b).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
  if (!as.size || !bs.size) return 0;
  let matches = 0;
  for (const token of as) if (bs.has(token)) matches += 1;
  return matches / Math.max(as.size, bs.size);
}

function buildFusionOpportunities(state = {}) {
  const brains = [...(state.internalBrains || []), ...(state.generatedBrains || [])];
  const items = [];
  for (let i = 0; i < brains.length; i += 1) {
    for (let j = i + 1; j < brains.length; j += 1) {
      const left = brains[i];
      const right = brains[j];
      const specialtyLeft = left.specialty || left.role || left.id;
      const specialtyRight = right.specialty || right.role || right.id;
      const synergy = Math.max(left.performance?.synergyScore || 0, right.performance?.synergyScore || 0, overlapScore(specialtyLeft, specialtyRight) * 100);
      if (synergy < 55) continue;
      items.push({
        id: `fuse-${left.id}-${right.id}`,
        leftBrainId: left.id,
        rightBrainId: right.id,
        suggestedName: `${specialtyLeft}-${specialtyRight}`.replace(/\s+/g, '-').toLowerCase(),
        synergyScore: Math.round(synergy),
        reason: 'Áreas complementares com alta sinergia e potencial de reduzir redundância.',
        status: 'candidate',
      });
    }
  }
  if (!items.length && brains.length >= 2) {
    const left = brains[0];
    const right = brains[1];
    items.push({
      id: `fuse-${left.id}-${right.id}`,
      leftBrainId: left.id,
      rightBrainId: right.id,
      suggestedName: `${left.id}-${right.id}-hybrid`,
      synergyScore: 57,
      reason: 'Fallback de consolidação para reduzir fragmentação entre cérebros líderes.',
      status: 'candidate',
    });
  }
  return { ok: true, items: items.slice(0, 8), generatedAt: new Date().toISOString() };
}

function fuseBrains(state = {}, payload = {}) {
  const leftId = payload.leftBrainId;
  const rightId = payload.rightBrainId;
  const all = [...(state.internalBrains || []), ...(state.generatedBrains || [])];
  const left = all.find((item) => item.id === leftId) || all[0];
  const right = all.find((item) => item.id === rightId) || all[1];
  if (!left || !right) {
    return { state, fusion: null, items: [] };
  }
  const fused = {
    id: payload.newBrainId || `fusion-${left.id}-${right.id}`,
    name: payload.name || `${left.name || left.id} + ${right.name || right.id}`,
    specialty: payload.specialty || `${left.specialty || left.role || left.id}/${right.specialty || right.role || right.id}`,
    status: 'online',
    createdAt: new Date().toISOString(),
    trustScore: Number((((left.trustScore || 0.65) + (right.trustScore || 0.65)) / 2).toFixed(2)),
    performance: {
      missionsCompleted: (left.performance?.missionsCompleted || 3) + (right.performance?.missionsCompleted || 3),
      successRate: Number((((left.performance?.successRate || 0.72) + (right.performance?.successRate || 0.72)) / 2).toFixed(2)),
      avgImpact: Math.round(((left.performance?.avgImpact || 60) + (right.performance?.avgImpact || 60)) / 2 + 6),
      avgLatency: Math.round(((left.performance?.avgLatency || 42) + (right.performance?.avgLatency || 42)) / 2 - 3),
      synergyScore: Math.round(((left.performance?.synergyScore || 60) + (right.performance?.synergyScore || 60)) / 2 + 12),
      confidence: Number((((left.performance?.confidence || 0.66) + (right.performance?.confidence || 0.66)) / 2).toFixed(2)),
      trend: 'up',
    },
  };
  state.generatedBrains = [fused, ...(state.generatedBrains || []).filter((item) => item.id !== fused.id)].slice(0, 24);
  state.fusionHistory = [{
    id: `fusion-history-${Date.now()}`,
    fusionId: fused.id,
    leftBrainId: left.id,
    rightBrainId: right.id,
    status: 'executed',
    createdAt: new Date().toISOString(),
  }, ...(state.fusionHistory || [])].slice(0, 40);
  return { state, fusion: fused, items: state.fusionHistory };
}

module.exports = { buildFusionOpportunities, fuseBrains };
