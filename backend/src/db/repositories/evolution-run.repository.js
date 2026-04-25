import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertEvolutionRun(entry) {
  const db = readDb();

  const record = {
    evolutionRunId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  db.evolutionRuns.push(record);
  writeDb(db);

  return record;
}

export function listEvolutionRuns() {
  const db = readDb();
  return db.evolutionRuns || [];
}
