function normalizeText(value) {
  return String(value || "").trim();
}

export function buildGoalState({
  title = "",
  objective = "",
  priority = "medium",
  status = "active",
  progress = 0,
  blockers = [],
  nextStep = "",
} = {}) {
  return {
    id: `goal_${Date.now()}`,
    title: normalizeText(title) || normalizeText(objective) || "Objetivo ativo",
    objective: normalizeText(objective) || normalizeText(title),
    priority,
    status,
    progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0,
    blockers: Array.isArray(blockers) ? blockers.filter(Boolean) : [],
    nextStep: normalizeText(nextStep),
    updatedAt: new Date().toISOString(),
  };
}

export function inferGoalFromMessage(message = "") {
  const text = normalizeText(message);
  if (!text) return null;

  return buildGoalState({
    title: text.slice(0, 80),
    objective: text,
    priority: /(urgente|agora|imediato)/i.test(text) ? "high" : "medium",
    nextStep: "Definir a primeira ação executável.",
  });
}
