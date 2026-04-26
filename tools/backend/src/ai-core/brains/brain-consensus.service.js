export function buildBrainConsensus({ selectedBrains = [], classification = {}, adaptiveContext = {} }) {
  const leadBrain = selectedBrains[0] || {
    brainId: "general_coordinator",
    label: "Coordenador Geral",
    specialty: "coordenação da resposta final",
    reason: "fallback"
  };

  const supportingBrains = selectedBrains.slice(1);
  const responseStyle =
    leadBrain.brainId === "technical_operator"
      ? "practical_fix"
      : leadBrain.brainId === "strategic_architect"
      ? "strategic_system_design"
      : leadBrain.brainId === "creative_editor"
      ? "creative_structured"
      : "adaptive_structured";

  return {
    leadBrain: leadBrain.brainId,
    leadLabel: leadBrain.label,
    supportingBrains: supportingBrains.map((item) => item.brainId),
    selectedBrains,
    responseStyle,
    rationale: [
      `categoria:${classification.category || "general_chat"}`,
      `modo_adaptativo:${adaptiveContext?.adaptiveProfile?.selectedMode || "adaptive_balanced"}`,
      `cerebro_lider:${leadBrain.brainId}`,
      `apoios:${supportingBrains.map((item) => item.brainId).join(",") || "none"}`
    ]
  };
}
