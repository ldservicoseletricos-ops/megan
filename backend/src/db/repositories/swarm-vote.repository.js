import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function createSwarmVote(payload = {}) {
  const db = readDb();

  const vote = {
    swarmVoteId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload
  };

  db.swarmVotes.push(vote);
  writeDb(db);

  return vote;
}

export function listSwarmVotes() {
  const db = readDb();
  return db.swarmVotes || [];
}
