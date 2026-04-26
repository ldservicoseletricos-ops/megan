import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertAdaptationHistory(payload) {
  const db = readDb();
  const record = {
    adaptationId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  db.adaptationHistory.push(record);
  writeDb(db);
  return record;
}

export function listAdaptationHistory({ userId } = {}) {
  const db = readDb();
  if (!userId) {
    return db.adaptationHistory;
  }
  return db.adaptationHistory.filter((item) => item.userId === userId);
}
