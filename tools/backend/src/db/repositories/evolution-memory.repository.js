import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertEvolutionMemory(entry) {
  const db = readDb();

  const record = {
    evolutionMemoryId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...entry
  };

  db.evolutionMemory.push(record);
  writeDb(db);

  return record;
}

export function listEvolutionMemory() {
  const db = readDb();
  return db.evolutionMemory || [];
}
