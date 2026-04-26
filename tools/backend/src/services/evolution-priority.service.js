import { getDbSnapshot, pushDbItem } from "../lib/store.js";

function toPriorityScore({ review, batchLearning, selfAnalysis }) {
  let score = 45;

  if (review?.topFriction?.includes("navigation_unresolved")) score += 30;
  if (review?.topFriction?.includes("long_reply")) score += 20;
  if ((batchLearning?.topFrictions || []).some((item) => item?.key === "blocked_action")) score += 15;
  if ((selfAnalysis?.frictionSignals || []).length === 0) score -= 10;

  return Math.max(10, Math.min(100, score));
}

export function updateEvolutionPriority({ userId = "luiz", conversationId = null, review, batchLearning, selfAnalysis } = {}) {
  const db = getDbSnapshot();
  const topCategory = review?.topFriction?.includes("navigation_unresolved")
    ? "navigation"
    : review?.topFriction?.includes("long_reply")
    ? "response_compactness"
    : "stability";

  const priority = {
    userId,
    conversationId,
    category: topCategory,
    score: toPriorityScore({ review, batchLearning, selfAnalysis }),
    rationale:
      topCategory === "navigation"
        ? "Falhas recentes de navegação indicam prioridade máxima para esse fluxo."
        : topCategory === "response_compactness"
        ? "Respostas longas demais continuam aparecendo e devem ser reduzidas."
        : "O sistema está estável; a prioridade é consolidar comportamento.",
  };

  const duplicate = db.evolutionPriorities.find(
    (item) => item?.userId === userId && item?.category === priority.category && item?.score === priority.score
  );

  if (duplicate) return duplicate;

  const entry = pushDbItem("evolutionPriorities", priority);
  return { ...priority, entry };
}
