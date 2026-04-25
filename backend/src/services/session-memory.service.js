import { getDb, updateDb } from "../lib/store.js";

function rememberSession(userId = "default", sessionPatch = {}) {
  return updateDb((draft) => {
    const current = draft.userSessions[userId] || {
      activeConversationId: null,
      lastMessage: null,
      lastMode: "general",
      lastSeenAt: null
    };
    draft.userSessions[userId] = {
      ...current,
      ...sessionPatch,
      lastSeenAt: new Date().toISOString()
    };
    return draft;
  }).userSessions[userId];
}

function getSessionMemory(userId = "default") {
  return getDb().userSessions[userId] || null;
}

export { rememberSession, getSessionMemory };
