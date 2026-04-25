import crypto from "crypto";
import { readDb, updateDb } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeObjectiveKey(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "-") || "general";
}

export function getObjectiveMemory(conversationId, objectiveKey = "general") {
  const db = readDb();
  const safeObjectiveKey = normalizeObjectiveKey(objectiveKey);

  return (
    (db.objectiveMemories || []).find(
      (item) =>
        item.conversationId === normalizeText(conversationId) &&
        item.objectiveKey === safeObjectiveKey
    ) || null
  );
}

export function upsertObjectiveMemory({
  conversationId,
  objectiveKey,
  objectiveTitle,
  status = "active",
  insight,
  lastPlan = null,
  lastExecution = null,
  lastOutcome = "",
}) {
  const safeConversationId = normalizeText(conversationId);
  const safeObjectiveKey = normalizeObjectiveKey(objectiveKey);
  const now = new Date().toISOString();
  let result = null;

  updateDb((db) => {
    db.objectiveMemories = Array.isArray(db.objectiveMemories) ? db.objectiveMemories : [];

    const index = db.objectiveMemories.findIndex(
      (item) =>
        item.conversationId === safeConversationId && item.objectiveKey === safeObjectiveKey
    );

    if (index === -1) {
      result = {
        id: crypto.randomUUID(),
        conversationId: safeConversationId,
        objectiveKey: safeObjectiveKey,
        objectiveTitle: normalizeText(objectiveTitle) || "Objetivo",
        status,
        insights: insight ? [normalizeText(insight)] : [],
        lastPlan,
        lastExecution,
        lastOutcome: normalizeText(lastOutcome),
        createdAt: now,
        updatedAt: now,
      };

      db.objectiveMemories.push(result);
      return db;
    }

    const current = db.objectiveMemories[index];
    const insights = Array.isArray(current.insights) ? current.insights : [];
    const nextInsights = insight ? [...insights, normalizeText(insight)].slice(-20) : insights;

    result = {
      ...current,
      objectiveTitle: normalizeText(objectiveTitle) || current.objectiveTitle,
      status,
      insights: nextInsights,
      lastPlan: lastPlan ?? current.lastPlan ?? null,
      lastExecution: lastExecution ?? current.lastExecution ?? null,
      lastOutcome: normalizeText(lastOutcome) || current.lastOutcome || "",
      updatedAt: now,
    };

    db.objectiveMemories[index] = result;
    return db;
  });

  return result;
}

export function listObjectiveMemories(conversationId) {
  const db = readDb();
  return (db.objectiveMemories || [])
    .filter((item) => (conversationId ? item.conversationId === conversationId : true))
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}
