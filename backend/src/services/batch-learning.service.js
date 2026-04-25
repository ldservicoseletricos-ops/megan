import { getDbSnapshot, pushDbItem } from "../lib/store.js";

function countBy(items = []) {
  return items.reduce((acc, item) => {
    const key = String(item || "unknown");
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(counter = {}, limit = 5) {
  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, count: value }));
}

export function consolidateBatchLearning({ userId = "luiz", conversationId = null } = {}) {
  const db = getDbSnapshot();
  const selfAnalysisRuns = db.selfAnalysisRuns.slice(0, 50);
  const predictions = db.predictions.slice(0, 50);
  const strategicRuns = db.strategicSupervisorRuns.slice(0, 50);

  const frictionCounter = countBy(
    selfAnalysisRuns.flatMap((item) => item?.result?.frictionSignals || [])
  );
  const predictionCounter = countBy(predictions.map((item) => item?.predictedAction));
  const focusCounter = countBy(strategicRuns.map((item) => item?.focus));

  const learnings = {
    userId,
    conversationId,
    topFrictions: topEntries(frictionCounter),
    topPredictions: topEntries(predictionCounter),
    topFocuses: topEntries(focusCounter),
    recommendation:
      frictionCounter.navigation_unresolved > 0
        ? "Subir navegação para prioridade máxima em cenários com destino e localização."
        : frictionCounter.long_reply > 0
        ? "Aplicar resposta curta por padrão em fluxos já resolvidos."
        : "Consolidar comportamento estável e continuar observando padrões.",
  };

  const entry = pushDbItem("batchLearnings", learnings);
  return { ...learnings, entry };
}
