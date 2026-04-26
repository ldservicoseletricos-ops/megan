function weightForBrain(brain = {}, context = 'balanced') {
  const base = Number(brain.autonomyLevel || 50);
  const loadPenalty = Math.round(Number(brain.load || 0) * 0.15);

  if (context === 'critical_risk') return Math.max(10, base - loadPenalty + (brain.id === 'guardian' ? 18 : 0));
  if (context === 'strategic_change') return Math.max(10, base - loadPenalty + (brain.id === 'strategic' ? 16 : 0));
  if (context === 'runtime_execution') return Math.max(10, base - loadPenalty + (brain.id === 'operational' ? 14 : 0));
  return Math.max(10, base - loadPenalty);
}

function buildContextualVoting(brains = [], context = 'balanced') {
  const ballots = brains.map((brain) => ({
    id: brain.id,
    label: brain.label || brain.id,
    context,
    weight: weightForBrain(brain, context),
  }));

  const totalWeight = ballots.reduce((acc, item) => acc + item.weight, 0);
  const dominant = ballots.slice().sort((a, b) => b.weight - a.weight)[0] || null;

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    context,
    totalWeight,
    dominant,
    ballots,
  };
}

module.exports = { buildContextualVoting };
