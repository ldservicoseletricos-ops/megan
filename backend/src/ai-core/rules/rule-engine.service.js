import { DEFAULT_RULES } from "./default-rules.js";
import { listLearnedRules } from "../../db/repositories/learned-rule.repository.js";

export function resolveActiveRules({ userId, message, classification }) {
  const learnedRules = listLearnedRules({ userId });

  const activeRules = [...DEFAULT_RULES, ...learnedRules];

  if (String(message).toLowerCase().includes("completo")) {
    activeRules.push({
      title: "current_message_full_delivery",
      description: "Mensagem atual pede entrega completa.",
      priority: 99
    });
  }

  if (classification.complexity === "high" || classification.riskLevel !== "low") {
    activeRules.push({
      title: "current_message_needs_critical_review",
      description: "Mensagem atual precisa de revisão crítica.",
      priority: 98
    });
  }

  return activeRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
