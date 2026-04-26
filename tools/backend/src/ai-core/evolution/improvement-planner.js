function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

export function buildImprovementProposals({ goals = [], hypotheses = [], diagnostics, activeProfile }) {
  const proposals = [];

  for (const goal of goals) {
    const relatedHypothesis = hypotheses.find((item) => {
      if (goal.slug === "raise-average-score") return item.name === "raise_reasoning_depth_for_low_scores";
      if (goal.slug === "reduce-critic-warnings") return item.name === "tighten_critic_guardrails";
      if (goal.slug === "specialize-technical-fix") return item.name === "specialize_technical_fix_flow";
      if (goal.slug === "increase-self-adaptation") return item.name === "expand_self_evolution_visibility";
      return false;
    });

    proposals.push({
      title: `Plano interno: ${goal.title}`,
      goalSlug: goal.slug,
      basedOnHypothesis: relatedHypothesis?.name || null,
      baselineProfile: activeProfile || "v4-baseline",
      candidateProfile: relatedHypothesis?.candidateVersion || `${activeProfile || "v4-baseline"}-goal-${goal.slug}`,
      objective: goal.description,
      rationale: goal.rationale,
      priority: goal.priority,
      expectedImpact: round(
        (relatedHypothesis ? 0.08 : 0.05) +
        ((diagnostics.averageScore || 0) < 0.9 ? 0.03 : 0) +
        ((diagnostics.warningRate || 0) > 0.25 ? 0.02 : 0)
      ),
      risk: relatedHypothesis?.risk || (goal.priority === "high" ? "medium" : "low"),
      actions: goal.actions || [],
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue
    });
  }

  return proposals;
}
