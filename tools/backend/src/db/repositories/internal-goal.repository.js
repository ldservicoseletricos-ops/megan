import crypto from "crypto";
import { readDb, writeDb } from "./json-store.js";

export function listInternalGoals({ status } = {}) {
  const db = readDb();
  const goals = db.internalGoals || [];

  if (!status) return goals;
  return goals.filter((item) => item.status === status);
}

export function upsertInternalGoal(entry) {
  const db = readDb();
  const now = new Date().toISOString();
  const goals = db.internalGoals || [];

  const existing = goals.find((item) => item.slug === entry.slug);

  if (existing) {
    existing.updatedAt = now;
    existing.title = entry.title;
    existing.description = entry.description;
    existing.priority = entry.priority;
    existing.category = entry.category;
    existing.targetMetric = entry.targetMetric;
    existing.targetValue = entry.targetValue;
    existing.currentValue = entry.currentValue;
    existing.rationale = entry.rationale;
    existing.actions = entry.actions || existing.actions || [];
    existing.status = entry.status || existing.status || "active";
    writeDb(db);
    return existing;
  }

  const record = {
    goalId: crypto.randomUUID(),
    slug: entry.slug,
    createdAt: now,
    updatedAt: now,
    status: entry.status || "active",
    actions: entry.actions || [],
    ...entry
  };

  goals.push(record);
  db.internalGoals = goals;
  writeDb(db);
  return record;
}

export function resolveInternalGoal({ slug, resolutionNote, status = "resolved" }) {
  const db = readDb();
  const goals = db.internalGoals || [];
  const goal = goals.find((item) => item.slug === slug);

  if (!goal) return null;

  goal.status = status;
  goal.updatedAt = new Date().toISOString();
  goal.resolutionNote = resolutionNote || goal.resolutionNote || null;
  writeDb(db);

  return goal;
}
