function buildMeritRanking(state = {}) {
  const brains = [...(state.internalBrains || []), ...(state.generatedBrains || [])];
  const items = brains.map((brain, index) => {
    const successRate = brain.performance?.successRate || Math.max(0.46, 0.84 - index * 0.04);
    const impact = brain.performance?.avgImpact || Math.max(36, 82 - index * 5);
    const confidence = brain.performance?.confidence || Math.max(0.5, 0.82 - index * 0.03);
    const meritScore = Math.round((successRate * 40) + (impact * 0.4) + (confidence * 20));
    return {
      id: brain.id,
      name: brain.name || brain.id,
      role: brain.specialty || brain.role || 'generalist',
      meritScore,
      successRate: Math.round(successRate * 100),
      avgImpact: impact,
      confidence: Math.round(confidence * 100),
      standing: meritScore >= 78 ? 'elite' : meritScore >= 62 ? 'strong' : 'watch',
    };
  }).sort((a, b) => b.meritScore - a.meritScore);
  return { ok: true, items, generatedAt: new Date().toISOString() };
}

module.exports = { buildMeritRanking };
