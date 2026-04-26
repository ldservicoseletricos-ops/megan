import { getDb, updateDb } from "../lib/store.js";

function ensurePersonalizedSettings(userId = "default") {
  const db = getDb();
  if (!db.personalizedSettings[userId]) {
    updateDb((draft) => {
      draft.personalizedSettings[userId] = {
        responseStyle: "balanced",
        mode: "general",
        updatedAt: new Date().toISOString()
      };
      return draft;
    });
  }
  return getDb().personalizedSettings[userId];
}

function getPersonalizedSettings(userId = "default") {
  return ensurePersonalizedSettings(userId);
}

export { ensurePersonalizedSettings, getPersonalizedSettings };
