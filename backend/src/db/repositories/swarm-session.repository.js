import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function createSwarmSession(payload = {}) {
  const db = readDb();

  const session = {
    swarmSessionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload
  };

  db.swarmSessions.push(session);
  writeDb(db);

  return session;
}

export function listSwarmSessions() {
  const db = readDb();
  return db.swarmSessions || [];
}
