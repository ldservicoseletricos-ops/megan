import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

function normalizeProfile(record = {}) {
  return {
    profileId: record.profileId || crypto.randomUUID(),
    userId: record.userId || "anonymous",
    preferredMode: record.preferredMode || "adaptive_balanced",
    responseStyle: record.responseStyle || "clear_practical",
    detailLevel: record.detailLevel || "balanced",
    technicalLevel: record.technicalLevel || "mixed",
    dominantCategories: record.dominantCategories || [],
    recurringObjectives: record.recurringObjectives || [],
    explicitPreferences: record.explicitPreferences || [],
    satisfactionSignals: record.satisfactionSignals || {
      highScoreRate: 0,
      lowScoreRate: 0,
      warningRate: 0
    },
    interactionCount: Number(record.interactionCount) || 0,
    lastContextSnapshot: record.lastContextSnapshot || null,
    confidence: Number(record.confidence) || 0,
    updatedAt: record.updatedAt || new Date().toISOString(),
    createdAt: record.createdAt || new Date().toISOString()
  };
}

export function getUserProfile(userId = "anonymous") {
  const db = readDb();
  return db.userProfiles.find((item) => item.userId === userId) || null;
}

export function upsertUserProfile(payload) {
  const db = readDb();
  const existingIndex = db.userProfiles.findIndex((item) => item.userId === payload.userId);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const merged = normalizeProfile({
      ...db.userProfiles[existingIndex],
      ...payload,
      updatedAt: now
    });
    db.userProfiles[existingIndex] = merged;
    writeDb(db);
    return merged;
  }

  const created = normalizeProfile({
    ...payload,
    createdAt: now,
    updatedAt: now
  });
  db.userProfiles.push(created);
  writeDb(db);
  return created;
}

export function listUserProfiles() {
  const db = readDb();
  return db.userProfiles;
}
