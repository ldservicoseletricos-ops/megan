export function selectAdaptiveProfile({ classification, userProfile, context = {}, activeGoals = [], priorities = [] }) {
  const urgency = classification?.urgency || "normal";
  const category = classification?.category || "general_chat";
  const forcedMode = context?.preferredMode || null;

  const selectedMode =
    forcedMode ||
    (urgency === "high"
      ? "direct_executor"
      : category === "technical_fix"
      ? "technical_operator"
      : category === "self_evolution"
      ? "strategic_architect"
      : userProfile?.preferredMode || "adaptive_balanced");

  const responseFrame =
    selectedMode === "technical_operator"
      ? "objective_fix"
      : selectedMode === "strategic_architect"
      ? "strategic_depth"
      : selectedMode === "direct_executor"
      ? "direct_action"
      : userProfile?.detailLevel === "deep"
      ? "contextual_depth"
      : "balanced_assistance";

  return {
    selectedMode,
    responseFrame,
    confidence: userProfile?.confidence || 0,
    reasons: [
      `categoria:${category}`,
      `urgencia:${urgency}`,
      `perfil_usuario:${userProfile?.preferredMode || "adaptive_balanced"}`,
      `prioridades:${priorities.slice(0, 2).map((item) => item.slug).join(",") || "none"}`,
      `metas_ativas:${activeGoals.slice(0, 2).map((item) => item.slug).join(",") || "none"}`
    ]
  };
}
