import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function createInteractionRecord(payload) {
  const db = readDb();

  const record = {
    interactionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload
  };

  db.interactions.push(record);
  writeDb(db);

  return record;
}

export function listInteractions() {
  const db = readDb();
  return db.interactions;
}
