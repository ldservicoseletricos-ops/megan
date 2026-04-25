import { getDbSnapshot, pushDbItem } from "../lib/store.js";

export function scheduleImprovement({ source = "system", recommendation = "", priority = 50, conversationId = null }) {
  const safeRecommendation = String(recommendation || "").trim();
  if (!safeRecommendation) return null;

  const db = getDbSnapshot();
  const existing = db.improvementAgenda.find(
    (item) => String(item.recommendation || "").trim().toLowerCase() === safeRecommendation.toLowerCase()
  );

  if (existing) {
    return existing;
  }

  return pushDbItem("improvementAgenda", {
    source,
    recommendation: safeRecommendation,
    priority: Number(priority || 50),
    status: "queued",
    conversationId,
  });
}
