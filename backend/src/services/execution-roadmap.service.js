import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getGoalsState, markGoalSubtask } from './goal-decomposer.service.js';
import { addPriorityQueueItem } from './priority-queue.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'execution-roadmap-store.json');

const DEFAULT_STATE = {
  version: '2.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function safeRead() {
  try {
    if (!fs.existsSync(STATE_PATH)) return { ...DEFAULT_STATE };
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { ...DEFAULT_STATE };
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
  return String(value || fallback).trim();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureUserBucket(state, userId = 'luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      currentActionId: null,
      actions: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function makeAction(goal, subtask, index) {
  return {
    id: `roadmap-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    goalId: goal.id,
    subtaskId: subtask.id,
    title: subtask.title,
    status: subtask.status === 'done' ? 'done' : 'queued',
    priority: subtask.priority || 'medium',
    blockedReason: '',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function syncRoadmapFromGoals({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const goalsState = getGoalsState({ userId });
  const activeGoal = goalsState.activeGoal;

  if (!activeGoal) {
    bucket.actions = [];
    bucket.currentActionId = null;
    bucket.updatedAt = nowIso();
    state.updatedAt = nowIso();
    safeWrite(state);
    return getExecutionRoadmapState({ userId });
  }

  const existingBySubtask = new Map((bucket.actions || []).map((item) => [item.subtaskId, item]));
  bucket.actions = (activeGoal.subtasks || []).map((subtask, index) => {
    const existing = existingBySubtask.get(subtask.id);
    return existing
      ? {
          ...existing,
          title: subtask.title,
          status: subtask.status === 'done' ? 'done' : existing.status === 'done' ? 'done' : 'queued',
          priority: subtask.priority || existing.priority || 'medium',
          updatedAt: nowIso()
        }
      : makeAction(activeGoal, subtask, index);
  });

  const current = bucket.actions.find((item) => item.status === 'in_progress')
    || bucket.actions.find((item) => item.status === 'queued')
    || bucket.actions.find((item) => item.status !== 'done')
    || null;

  bucket.currentActionId = current?.id || null;
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();
  safeWrite(state);

  if (current?.title) {
    addPriorityQueueItem({
      userId,
      title: current.title,
      type: 'goal_roadmap',
      level: current.priority === 'high' ? 'urgent_important' : 'strategic',
      source: 'execution_roadmap',
      note: activeGoal.title
    });
  }

  return getExecutionRoadmapState({ userId });
}

export function getExecutionRoadmapState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const currentAction = (bucket.actions || []).find((item) => item.id === bucket.currentActionId) || null;
  const queued = (bucket.actions || []).filter((item) => item.status === 'queued');
  const blocked = (bucket.actions || []).filter((item) => item.status === 'blocked');
  const completed = (bucket.actions || []).filter((item) => item.status === 'done');
  const failed = (bucket.actions || []).filter((item) => item.status === 'failed');
  const total = bucket.actions.length || 1;
  const progress = Math.max(0, Math.min(100, Math.round((completed.length / total) * 100)));

  return {
    userId: bucket.userId,
    progress,
    totalActions: bucket.actions.length,
    currentAction,
    nextAction: queued[0] || null,
    blockedActions: clone(blocked),
    completedActions: clone(completed),
    failedActions: clone(failed),
    actions: clone(bucket.actions)
  };
}

export function advanceExecutionRoadmap({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const active = (bucket.actions || []).find((item) => item.status === 'in_progress') || (bucket.actions || []).find((item) => item.status === 'queued');
  if (!active) {
    return { ok: false, error: 'Nenhuma ação disponível para avançar.' };
  }

  bucket.actions = (bucket.actions || []).map((item) => {
    if (item.id === active.id) return { ...item, status: 'done', updatedAt: nowIso() };
    if (item.status === 'queued' && item.id !== active.id && !bucket.currentActionId) return { ...item, status: 'in_progress', updatedAt: nowIso() };
    return item;
  });

  markGoalSubtask({ userId, goalId: active.goalId, subtaskId: active.subtaskId, status: 'done' });
  state.updatedAt = nowIso();
  safeWrite(state);
  return { ok: true, state: syncRoadmapFromGoals({ userId }) };
}

export function failExecutionRoadmap({ userId = 'luiz', actionId, reason = '' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const targetId = normalizeText(actionId || bucket.currentActionId, '');
  let found = false;
  bucket.actions = (bucket.actions || []).map((item) => {
    if (item.id !== targetId) return item;
    found = true;
    return {
      ...item,
      status: 'failed',
      blockedReason: normalizeText(reason, 'Falha registrada no roadmap'),
      updatedAt: nowIso()
    };
  });
  state.updatedAt = nowIso();
  safeWrite(state);
  if (!found) return { ok: false, error: 'Ação do roadmap não encontrada.' };
  return { ok: true, state: getExecutionRoadmapState({ userId }) };
}
