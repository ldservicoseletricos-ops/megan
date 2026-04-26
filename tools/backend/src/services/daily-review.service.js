import { getDbSnapshot, pushDbItem } from "../lib/store.js";

function average(values = []) {
  const numbers = values.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  if (!numbers.length) return 0;
  return numbers.reduce((sum, current) => sum + current, 0) / numbers.length;
}

export function runDailyReview({ userId = "luiz", conversationId = null } = {}) {
  const db = getDbSnapshot();
  const selfAnalysisRuns = db.selfAnalysisRuns.slice(0, 30);
  const strategicRuns = db.strategicSupervisorRuns.slice(0, 30);
  const agenda = db.improvementAgenda.slice(0, 30);

  const avgQualityScore = Number(average(selfAnalysisRuns.map((item) => item?.result?.qualityScore)).toFixed(2));
  const frictionSignals = selfAnalysisRuns.flatMap((item) => item?.result?.frictionSignals || []);
  const topFriction = [...new Set(frictionSignals)].slice(0, 5);
  const dominantFocus = strategicRuns[0]?.focus || "general_assistance";
  const queuedImprovements = agenda.filter((item) => item?.status === "queued").length;

  const review = {
    userId,
    conversationId,
    avgQualityScore,
    dominantFocus,
    topFriction,
    queuedImprovements,
    summary:
      topFriction.length > 0
        ? `Hoje a Megan teve mais atrito em: ${topFriction.join(", ")}.`
        : "Hoje a Megan manteve o fluxo sem atritos relevantes.",
    nextPriority:
      topFriction.includes("navigation_unresolved")
        ? "Melhorar resolução de navegação."
        : topFriction.includes("long_reply")
        ? "Reduzir respostas longas."
        : "Preservar comportamento atual e consolidar aprendizados.",
  };

  const entry = pushDbItem("dailyReviews", review);
  return { ...review, entry };
}
