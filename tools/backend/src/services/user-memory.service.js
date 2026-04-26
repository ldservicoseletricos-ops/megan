import { getDb, updateDb, pushLimited } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function ensureUserMemory(userId = "default") {
  const safeUserId = normalizeText(userId) || "default";
  const db = getDb();

  if (!db.userMemories[safeUserId]) {
    updateDb((draft) => {
      draft.userMemories[safeUserId] = {
        facts: [],
        aliases: {},
        preferences: {},
        knownPlaces: {},
        episodicLearnings: [],
        conversationSummaries: [],
        projects: {},
        lastUpdatedAt: new Date().toISOString(),
      };
      return draft;
    });
  }

  return getDb().userMemories[safeUserId];
}

function getUserMemory(userId = "default") {
  return ensureUserMemory(userId);
}

function updateUserMemory(userId = "default", patch = {}) {
  const safeUserId = normalizeText(userId) || "default";
  updateDb((draft) => {
    const current = draft.userMemories[safeUserId] || ensureUserMemory(safeUserId);
    draft.userMemories[safeUserId] = {
      ...current,
      ...(patch || {}),
      preferences: {
        ...(current.preferences || {}),
        ...((patch && patch.preferences) || {}),
      },
      aliases: {
        ...(current.aliases || {}),
        ...((patch && patch.aliases) || {}),
      },
      lastUpdatedAt: new Date().toISOString(),
    };
    return draft;
  });
  return getDb().userMemories[safeUserId];
}

function appendConversationSummary({ userId = "default", summary = {} } = {}) {
  const safeUserId = normalizeText(userId) || "default";
  updateDb((draft) => {
    const current = draft.userMemories[safeUserId] || ensureUserMemory(safeUserId);
    const nextItem = {
      id: summary?.id || `summary_${Date.now()}`,
      conversationId: summary?.conversationId || null,
      summary: normalizeText(summary?.summary),
      intent: summary?.intent || null,
      createdAt: summary?.createdAt || new Date().toISOString(),
    };

    draft.userMemories[safeUserId] = {
      ...current,
      conversationSummaries: pushLimited(current.conversationSummaries || [], nextItem, 80),
      lastUpdatedAt: new Date().toISOString(),
    };
    return draft;
  });

  return getDb().userMemories[safeUserId];
}

export { ensureUserMemory, getUserMemory, updateUserMemory, appendConversationSummary };
