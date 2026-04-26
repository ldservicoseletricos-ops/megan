import fs from 'fs';
import path from 'path';

const STATE_PATH = path.join(DATA_DIR, 'feedback-loop-state.json');

const DEFAULT_STATE = {
  version: '3.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeRead() {
  try {
    if (!fs.existsSync(STATE_PATH)) return structuredClone(DEFAULT_STATE);
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function safeWrite(state) {
  ensureDir();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureUserBucket(state, userId = 'luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      totalEvents: 0,
      successCount: 0,
      failureCount: 0,
      lastOutcome: 'idle',
      successRate: 0,
      recentFeedback: [],
      topFailureReasons: [],
      improvementSignals: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function recomputeBucket(bucket) {
  const events = Array.isArray(bucket.recentFeedback) ? bucket.recentFeedback : [];
  const successCount = events.filter((item) => item.outcome === 'success').length;
  const failureCount = events.filter((item) => item.outcome === 'failure').length;
  const reasonMap = new Map();
  for (const item of events) {
    if (item.outcome !== 'failure') continue;
    const reason = normalizeText(item.reason, 'Falha sem motivo claro');
    reasonMap.set(reason, (reasonMap.get(reason) || 0) + 1);
  }
  const topFailureReasons = [...reasonMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }));

  const improvementSignals = [];
  if (failureCount >= 2) improvementSignals.push('Reduzir agressividade do próximo ciclo e validar passo a passo.');
  if (successCount >= 2) improvementSignals.push('Reforçar padrão recente de sucesso no roadmap atual.');
  if (topFailureReasons[0]?.reason) improvementSignals.push(`Atacar causa principal: ${topFailureReasons[0].reason}.`);

  bucket.totalEvents = events.length;
  bucket.successCount = successCount;
  bucket.failureCount = failureCount;
  bucket.successRate = events.length ? Math.round((successCount / events.length) * 100) : 0;
  bucket.lastOutcome = events[0]?.outcome || 'idle';
  bucket.topFailureReasons = topFailureReasons;
  bucket.improvementSignals = improvementSignals.slice(0, 4);
  bucket.updatedAt = nowIso();
  return bucket;
}

export function registerFeedback(input = {}) {
  const state = safeRead();
  const userId = String(input.userId || 'luiz');
  const bucket = ensureUserBucket(state, userId);
  const entry = {
    id: `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: normalizeText(input.type, 'execution'),
    outcome: normalizeText(input.outcome, 'success'),
    title: normalizeText(input.title || input.actionTitle || 'Evento de execução'),
    reason: normalizeText(input.reason, ''),
    detail: normalizeText(input.detail, ''),
    source: normalizeText(input.source, 'system'),
    createdAt: nowIso()
  };

  bucket.recentFeedback = [entry, ...(bucket.recentFeedback || [])].slice(0, 30);
  recomputeBucket(bucket);
  state.updatedAt = nowIso();
  safeWrite(state);

  return { ok: true, feedback: clone(entry), state: getFeedbackLoopState({ userId }) };
}

export function getFeedbackLoopState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = recomputeBucket(ensureUserBucket(state, String(userId || 'luiz')));
  return clone(bucket);
}
