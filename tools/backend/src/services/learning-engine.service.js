import { getDb, updateDb, pushLimited } from "../lib/store.js";

function learnFromResult(payload = {}) {
  const result = {
    id: `learn_${Date.now()}`,
    topic: payload.topic || "general",
    outcome: payload.outcome || "unknown",
    insight: payload.insight || "Sem insight informado.",
    createdAt: new Date().toISOString()
  };

  updateDb((draft) => {
    draft.learningLogs = pushLimited(draft.learningLogs, result, 200);
    return draft;
  });

  return result;
}

function listLearningLogs() {
  return getDb().learningLogs || [];
}

export { learnFromResult, listLearningLogs };
