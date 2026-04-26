import crypto from "crypto";
import { readDb, updateDb } from "../lib/store.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeObjectiveKey(value) {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "-") || "general";
}

function sortQueue(items = []) {
  return [...items].sort((a, b) => {
    const priorityDiff = Number(b.priority || 0) - Number(a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });
}

export function listQueue(conversationId) {
  const db = readDb();
  const items = (db.persistentQueues || []).filter((item) =>
    conversationId ? item.conversationId === conversationId : true
  );

  return sortQueue(items);
}

export function enqueueTask({
  conversationId,
  objectiveKey,
  title,
  type = "task",
  payload = {},
  priority = 50,
  dueAt = null,
}) {
  const now = new Date().toISOString();

  const queueItem = {
    id: crypto.randomUUID(),
    conversationId: normalizeText(conversationId),
    objectiveKey: normalizeObjectiveKey(objectiveKey),
    title: normalizeText(title) || "Tarefa",
    type: normalizeText(type) || "task",
    payload: payload && typeof payload === "object" ? payload : {},
    status: "queued",
    priority: Number.isFinite(Number(priority)) ? Number(priority) : 50,
    resumeCount: 0,
    lastError: "",
    dueAt: dueAt || null,
    createdAt: now,
    updatedAt: now,
  };

  updateDb((db) => {
    db.persistentQueues = Array.isArray(db.persistentQueues) ? db.persistentQueues : [];
    db.persistentQueues.push(queueItem);
    return db;
  });

  return queueItem;
}

export function updateQueueTask(taskId, updater) {
  let updated = null;

  updateDb((db) => {
    const items = Array.isArray(db.persistentQueues) ? db.persistentQueues : [];
    const index = items.findIndex((item) => item.id === taskId);
    if (index === -1) return db;

    const current = items[index];
    const changes = typeof updater === "function" ? updater(current) || {} : {};

    updated = {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updated;
    db.persistentQueues = items;
    return db;
  });

  return updated;
}

export function getNextRunnableTask(conversationId) {
  const items = listQueue(conversationId).filter((item) => item.status === "queued");
  return items[0] || null;
}

export function summarizeQueue(conversationId) {
  const items = listQueue(conversationId);

  const summary = {
    total: items.length,
    queued: 0,
    running: 0,
    done: 0,
    failed: 0,
    cancelled: 0,
    nextTask: null,
  };

  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(summary, item.status)) {
      summary[item.status] += 1;
    }
  }

  summary.nextTask = items.find((item) => item.status === "queued") || null;
  return summary;
}
