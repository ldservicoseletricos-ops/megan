import { retrieveRankedMemories } from "./memory-retrieval.service.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export function buildSmartContext({ userId = "default", message = "", conversation = null, memory = {} } = {}) {
  const rankedMemories = retrieveRankedMemories({ userId, query: message, limit: 6 });
  const project = memory?.projects?.[memory?.activeProjectId || "default"] || null;

  return {
    message: normalizeText(message),
    conversationId: conversation?.id || null,
    rankedMemories,
    activeProject: project,
    activeProjectId: memory?.activeProjectId || null,
    memoryUpdatedAt: memory?.updatedAt || null,
    createdAt: new Date().toISOString(),
  };
}
