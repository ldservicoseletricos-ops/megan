const CATEGORY_RULES = [
  {
    category: "self_evolution",
    intent: "ai_self_improvement",
    keywords: ["evoluir", "sozinha", "autoevolução", "melhorar sozinha", "auto melhorar", "evolução"]
  },
  {
    category: "technical_fix",
    intent: "technical_fix",
    keywords: ["erro", "corrigir", "bug", "falha", "frontend", "backend", "arquivo", "código", "codigo"]
  },
  {
    category: "strategic_planning",
    intent: "strategic_planning",
    keywords: ["arquitetura", "planejar", "estratégia", "estrategia", "estrutura", "roadmap"]
  },
  {
    category: "general_chat",
    intent: "general_assistance",
    keywords: []
  }
];

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function classifyTask({ message = "" }) {
  const normalized = String(message).toLowerCase();

  const matched =
    CATEGORY_RULES.find((rule) => rule.keywords.length > 0 && includesAny(normalized, rule.keywords)) ||
    CATEGORY_RULES[CATEGORY_RULES.length - 1];

  const complexity =
    normalized.length > 180 || matched.category === "self_evolution" || matched.category === "technical_fix"
      ? "high"
      : "medium";

  const riskLevel =
    matched.category === "technical_fix" || matched.category === "self_evolution" ? "medium" : "low";

  const expectedOutput =
    matched.category === "technical_fix"
      ? "structured_solution"
      : matched.category === "self_evolution"
      ? "strategic_architecture"
      : "direct_answer";

  return {
    category: matched.category,
    intent: matched.intent,
    complexity,
    riskLevel,
    expectedOutput,
    urgency: normalized.includes("agora") || normalized.includes("urgente") ? "high" : "normal"
  };
}
