import { readDb, writeDb } from "./json-store.js";

function createEmptyMetric(brainId) {
  return {
    brainId,
    totalRuns: 0,
    wins: 0,
    totalScore: 0,
    averageScore: 0,
    lastUsedAt: null,
    updatedAt: new Date().toISOString()
  };
}

export function upsertBrainPerformance({ brainId, score = 0, won = false }) {
  const db = readDb();
  db.brainPerformance = Array.isArray(db.brainPerformance) ? db.brainPerformance : [];

  const existing = db.brainPerformance.find((item) => item.brainId === brainId);
  const target = existing || createEmptyMetric(brainId);

  target.totalRuns += 1;
  target.totalScore += Number(score) || 0;
  target.averageScore = Number((target.totalScore / target.totalRuns).toFixed(3));
  target.lastUsedAt = new Date().toISOString();
  target.updatedAt = target.lastUsedAt;

  if (won) {
    target.wins += 1;
  }

  if (!existing) {
    db.brainPerformance.push(target);
  }

  writeDb(db);
  return target;
}

export function listBrainPerformance() {
  const db = readDb();
  return (db.brainPerformance || []).sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return b.wins - a.wins;
  });
}
