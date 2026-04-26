import { getDb, updateDb } from "../lib/store.js";

function ensureUserProfile(userId = "default") {
  const db = getDb();
  if (!db.userProfiles[userId]) {
    updateDb((draft) => {
      draft.userProfiles[userId] = {
        userId,
        name: userId,
        role: "user",
        responseStyle: "balanced",
        preferredMode: "general",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!draft.users.includes(userId)) draft.users.push(userId);
      return draft;
    });
  }
  return getDb().userProfiles[userId];
}

function getUserProfile(userId = "default") {
  return ensureUserProfile(userId);
}

export { ensureUserProfile, getUserProfile };
