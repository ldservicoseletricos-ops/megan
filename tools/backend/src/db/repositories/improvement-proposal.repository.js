import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function insertImprovementProposal(entry) {
  const db = readDb();

  const record = {
    proposalId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...entry
  };

  db.improvementProposals.push(record);
  writeDb(db);

  return record;
}

export function listImprovementProposals() {
  const db = readDb();
  return db.improvementProposals || [];
}
