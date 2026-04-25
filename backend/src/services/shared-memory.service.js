import { getDb, updateDb } from "../lib/store.js";
import { getUserProfile } from "./user-profile.service.js";
import { getUserPermissions } from "./permissions.service.js";

function ensureSharedMemory(teamId) {
  const db = getDb();
  if (!db.sharedMemories[teamId]) {
    updateDb((draft) => {
      draft.sharedMemories[teamId] = {
        teamId,
        facts: [],
        updatedAt: new Date().toISOString()
      };
      return draft;
    });
  }
  return getDb().sharedMemories[teamId];
}

function getSharedMemoryByUser(userId = "default") {
  const profile = getUserProfile(userId);
  if (!profile.teamId) return null;
  return ensureSharedMemory(profile.teamId);
}

function addSharedFact(userId = "default", fact = "") {
  const profile = getUserProfile(userId);
  const permissions = getUserPermissions(userId);
  if (!profile.teamId || !permissions.sharedMemoryWrite || !fact) return getSharedMemoryByUser(userId);
  return updateDb((draft) => {
    const current = draft.sharedMemories[profile.teamId] || { teamId: profile.teamId, facts: [] };
    current.facts = [...new Set([...(current.facts || []), fact])];
    current.updatedAt = new Date().toISOString();
    draft.sharedMemories[profile.teamId] = current;
    return draft;
  }).sharedMemories[profile.teamId];
}

export { ensureSharedMemory, getSharedMemoryByUser, addSharedFact };
