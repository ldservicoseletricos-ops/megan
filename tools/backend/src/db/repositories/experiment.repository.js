import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertExperiment(entry) {
  const db = readDb();

  const record = {
    experimentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  db.experiments.push(record);
  writeDb(db);

  return record;
}

export function listExperiments() {
  const db = readDb();
  return db.experiments;
}
