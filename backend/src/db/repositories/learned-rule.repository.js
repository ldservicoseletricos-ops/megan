import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertLearnedRule(entry) {
  const db = readDb();

  const existing = db.learnedRules.find(
    (rule) => rule.title === entry.title && rule.userId === entry.userId
  );

  if (existing) {
    existing.updatedAt = new Date().toISOString();
    existing.confidence = Math.max(existing.confidence || 0, entry.confidence || 0);
    existing.isActive = true;
    writeDb(db);
    return existing;
  }

  const record = {
    ruleId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    ...entry
  };

  db.learnedRules.push(record);
  writeDb(db);

  return record;
}

export function listLearnedRules({ userId }) {
  const db = readDb();
  return db.learnedRules.filter((rule) => rule.userId === userId && rule.isActive);
}
