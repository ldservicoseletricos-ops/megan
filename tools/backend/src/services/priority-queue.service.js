import fs from 'fs';
import path from 'path';

const STATE_PATH = path.join(DATA_DIR, 'priority-queue-state.json');
const MAX_ITEMS = 200;

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeRead(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function safeWrite(filePath, data) {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value, fallback = '') {
  return String(value || fallback).trim();
}

function getState() {
  return safeRead(STATE_PATH, { version: '91.0.0', updatedAt: null, users: {} });
}

function setState(state) {
  state.version = '91.0.0';
  state.updatedAt = nowIso();
  safeWrite(STATE_PATH, state);
  return state;
}

function getUserQueue(userId = 'anonymous') {
  const state = getState();
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      items: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
    setState(state);
  }
  return { state, bucket: state.users[userId] };
}

function computePriorityScore(item = {}) {
  const level = normalizeText(item.level || item.bucket || 'strategic', 'strategic').toLowerCase();
  const map = {
    urgent_important: 100,
    urgent: 95,
    strategic: 80,
    automatic: 60,
    later: 30
  };
  return Number(item.priorityScore || item.weight || map[level] || 50);
}

function normalizeQueueItem(item = {}) {
  return {
    id: item.id || `queue-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: normalizeText(item.title || item.label || item.action, 'unnamed_queue_item'),
    type: normalizeText(item.type, 'task'),
    level: normalizeText(item.level || item.bucket, 'strategic'),
    status: normalizeText(item.status, 'queued'),
    source: normalizeText(item.source, 'system'),
    priorityScore: computePriorityScore(item),
    note: normalizeText(item.note || item.reason, ''),
    createdAt: item.createdAt || nowIso(),
    updatedAt: nowIso(),
    startedAt: item.startedAt || null,
    completedAt: item.completedAt || null,
    blockedAt: item.blockedAt || null
  };
}

export function addPriorityQueueItem(input = {}) {
  const userId = String(input.userId || 'anonymous');
  const { state, bucket } = getUserQueue(userId);
  const item = normalizeQueueItem(input);

  const deduped = (bucket.items || []).filter(
    (existing) => `${existing.type}::${existing.title}`.toLowerCase() !== `${item.type}::${item.title}`.toLowerCase()
  );

  state.users[userId] = {
    ...bucket,
    items: [item, ...deduped]
      .sort((a, b) => b.priorityScore - a.priorityScore || String(a.createdAt).localeCompare(String(b.createdAt)))
      .slice(0, MAX_ITEMS),
    updatedAt: nowIso()
  };

  setState(state);

  return {
    userId,
    added: true,
    item,
    queueSize: state.users[userId].items.length
  };
}

export function updatePriorityQueueItem(input = {}) {
  const userId = String(input.userId || 'anonymous');
  const ref = normalizeText(input.id || input.taskId || input.title, '');
  const { state, bucket } = getUserQueue(userId);
  let updatedItem = null;

  state.users[userId] = {
    ...bucket,
    items: (bucket.items || []).map((item) => {
      const matches = item.id === ref || item.title === ref || (!ref && item.status !== 'done');
      if (!matches) return item;
      updatedItem = {
        ...item,
        status: normalizeText(input.status, item.status),
        note: normalizeText(input.note || input.reason, item.note || ''),
        startedAt: input.status === 'in_progress' ? nowIso() : item.startedAt || null,
        completedAt: input.status === 'done' ? nowIso() : item.completedAt || null,
        blockedAt: input.status === 'blocked' ? nowIso() : item.blockedAt || null,
        updatedAt: nowIso()
      };
      return updatedItem;
    }),
    updatedAt: nowIso()
  };

  setState(state);

  return {
    userId,
    updated: Boolean(updatedItem),
    item: updatedItem,
    queueSize: state.users[userId].items.length
  };
}

export function getNextPriorityQueueItem({ userId = 'anonymous', includeBlocked = false } = {}) {
  const { bucket } = getUserQueue(String(userId || 'anonymous'));
  const nextItem = (bucket.items || []).find((item) => {
    if (item.status === 'done') return false;
    if (!includeBlocked && item.status === 'blocked') return false;
    return ['queued', 'open', 'in_progress', 'ready'].includes(item.status);
  }) || null;

  return {
    userId,
    nextItem: clone(nextItem)
  };
}

export function listPriorityQueue({ userId = 'anonymous', includeDone = false } = {}) {
  const { bucket } = getUserQueue(String(userId || 'anonymous'));
  const items = (bucket.items || []).filter((item) => includeDone || item.status !== 'done');

  return {
    userId,
    queueProfile: 'v91-priority-queue-engine',
    total: items.length,
    urgentImportant: items.filter((item) => item.level === 'urgent_important').length,
    strategic: items.filter((item) => item.level === 'strategic').length,
    automatic: items.filter((item) => item.level === 'automatic').length,
    later: items.filter((item) => item.level === 'later').length,
    items: clone(items)
  };
}
