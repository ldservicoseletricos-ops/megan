import { insertLearnedRule } from "../../db/repositories/learned-rule.repository.js";

export function updateHeuristics({ userId, patterns }) {
  const createdRules = [];

  for (const pattern of patterns) {
    if (pattern.type === "delivery_preference_full_content" && pattern.occurrences >= 2) {
      const rule = insertLearnedRule({
        userId,
        title: "deliver_complete_content",
        description: "Quando o usuário pedir para colar ou trouxer contexto de arquivo, priorizar resposta completa.",
        confidence: pattern.confidence,
        priority: 97
      });

      createdRules.push(rule);
    }
  }

  return createdRules;
}
