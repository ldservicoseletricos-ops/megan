function scoreByBrainId(brainId) {
  const weights = {
    general_coordinator: 0.87,
    technical_operator: 0.93,
    strategic_architect: 0.91,
    creative_editor: 0.84,
    operations_orchestrator: 0.88,
    quality_guardian: 0.9
  };

  return weights[brainId] || 0.8;
}

function scoreByCategory(brainId, category) {
  if (category === "technical_fix" && brainId === "technical_operator") return 0.05;
  if (category === "self_evolution" && brainId === "strategic_architect") return 0.05;
  if (category === "general_chat" && brainId === "general_coordinator") return 0.03;
  if (brainId === "quality_guardian") return 0.02;
  return 0;
}

export function voteSwarmOutputs({ outputs = [], classification = {} }) {
  const category = classification.category || "general_chat";

  const scored = outputs.map((item) => {
    const score = Number((scoreByBrainId(item.brainId) + scoreByCategory(item.brainId, category) + (item.confidence || 0) * 0.05).toFixed(3));

    return {
      brainId: item.brainId,
      label: item.label,
      score,
      recommendation: item.recommendation
    };
  }).sort((a, b) => b.score - a.score);

  const winner = scored[0] || {
    brainId: "general_coordinator",
    label: "Coordenador Geral",
    score: 0.8,
    recommendation: "fallback"
  };

  return {
    winner,
    ranking: scored,
    votingMode: scored.length > 1 ? "multi_vote" : "single_vote"
  };
}
