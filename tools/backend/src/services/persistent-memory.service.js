import { getDb, updateDb, pushLimited } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export async function loadPersistentState({ userId = "default" } = {}) {
  const safeUserId = normalizeText(userId) || "default";
  const db = getDb();
  const memory = db.userMemories?.[safeUserId] || {
    profile: {},
    preferences: {},
    aliases: {},
    projects: {},
  };

  return {
    ok: true,
    userId: safeUserId,
    state: {
      memory,
      operationalHistory: Array.isArray(db.auditLogs) ? db.auditLogs.filter((item) => item?.userId === safeUserId).slice(0, 100) : [],
    },
  };
}

export async function savePersistentState({ userId = "default", state = {} } = {}) {
  const safeUserId = normalizeText(userId) || "default";

  updateDb((draft) => {
    const current = draft.userMemories?.[safeUserId] || {};
    draft.userMemories[safeUserId] = {
      ...current,
      ...((state && state.memory) || {}),
      lastUpdatedAt: new Date().toISOString(),
    };
    return draft;
  });

  return {
    ok: true,
    userId: safeUserId,
    savedAt: new Date().toISOString(),
    state,
  };
}

export function appendOperationalHistory({ state = {}, event = {} } = {}) {
  const currentHistory = Array.isArray(state?.operationalHistory) ? state.operationalHistory : [];

  const nextEvent = {
    id: event?.id || `op_${Date.now()}`,
    type: event?.type || "generic_event",
    summary: event?.summary || "",
    ok: typeof event?.ok === "boolean" ? event.ok : true,
    createdAt: event?.createdAt || new Date().toISOString(),
    meta: event?.meta || {},
  };

  return {
    ...state,
    operationalHistory: pushLimited(currentHistory, nextEvent, 300),
  };
}

export function mergePersistentMemory({ state = {}, memory = {} } = {}) {
  return {
    ...state,
    memory: {
      ...(state?.memory || {}),
      ...(memory || {}),
      updatedAt: new Date().toISOString(),
    },
  };
}
