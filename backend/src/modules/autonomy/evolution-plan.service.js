function buildEvolutionPlan({ priorities = {} } = {}) {
  const steps = (priorities.priorities || []).map((item, index) => ({
    step: index + 1,
    title: item.title,
    expectedImpact: item.impact,
    estimatedEffort: item.effort,
    rationale: item.rationale,
  }));

  return {
    ok: true,
    mode: 'supervised_continuous_evolution',
    nextCycle: steps[0] || null,
    steps,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildEvolutionPlan };
