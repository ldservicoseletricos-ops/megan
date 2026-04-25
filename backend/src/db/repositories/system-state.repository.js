import { readDb, writeDb } from "./json-store.js";

export function getSystemState() {
  const db = readDb();
  return db.systemState || {};
}

export function updateSystemState(patch) {
  const db = readDb();

  db.systemState = {
    ...(db.systemState || {}),
    ...patch
  };

  writeDb(db);
  return db.systemState;
}
