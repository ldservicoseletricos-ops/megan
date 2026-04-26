import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertMemory(entry) {
  const db = readDb();

  const record = {
    memoryId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...entry
  };

  db.memories.push(record);
  writeDb(db);

  return record;
}

export function findMemoriesByLayer({ userId, layer, sessionId }) {
  const db = readDb();

  return db.memories.filter((item) => {
    if (item.userId !== userId) return false;
    if (item.memoryLayer !== layer) return false;
    if (sessionId && item.sessionId && item.sessionId !== sessionId) return false;
    return true;
  });
}
