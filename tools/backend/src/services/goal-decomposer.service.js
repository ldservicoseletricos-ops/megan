import fs from 'fs';
import path from 'path';

const STATE_PATH = path.join(DATA_DIR, 'goals-store.json');

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

function slugify(value) {
  return normalizeText(value, 'goal')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'goal';
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSubtasks(goalTitle = '') {
  const title = normalizeText(goalTitle, 'Meta sem título');
  return [
    { title: `Definir escopo de: ${title}`, status: 'queued', priority: 'high', dependsOn: [] },
    { title: `Quebrar ${title} em etapas menores`, status: 'queued', priority: 'high', dependsOn: ['Definir escopo de: ' + title] },
    { title: `Executar primeiro passo de ${title}`, status: 'queued', priority: 'medium', dependsOn: ['Quebrar ' + title + ' em etapas menores'] },
    { title: `Validar resultado inicial de ${title}`, status: 'queued', priority: 'medium', dependsOn: ['Executar primeiro passo de ' + title] }
  ].map((item, index) => ({
    id: `subtask-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    ...item,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }));
}

function scoreGoal(goal = {}) {
  const subtasks = Array.isArray(goal.subtasks) ? goal.subtasks : [];
  const completed = subtasks.filter((item) => item.status === 'done').length;
  const total = subtasks.length || 1;
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

function ensureUserBucket(state, userId = 'luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      goals: [],
      activeGoalId: null,
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

export function getGoalsState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const activeGoal = (bucket.goals || []).find((goal) => goal.id === bucket.activeGoalId) || bucket.goals[0] || null;
  return {
    userId: bucket.userId,
    totalGoals: bucket.goals.length,
    activeGoalId: bucket.activeGoalId,
    activeGoal,
    goals: clone(bucket.goals)
  };
}

export function createGoal(input = {}) {
  const state = safeRead();
  const userId = String(input.userId || 'luiz');
  const bucket = ensureUserBucket(state, userId);
  const title = normalizeText(input.title || input.goal || input.objective, 'Nova meta Megan');
  const summary = normalizeText(input.summary, `Meta criada para ${title}.`);
  const subtasks = Array.isArray(input.subtasks) && input.subtasks.length
    ? input.subtasks.map((item, index) => ({
        id: item.id || `subtask-${Date.now()}-${index}`,
        title: normalizeText(item.title || item, `Subtarefa ${index + 1}`),
        status: normalizeText(item.status, 'queued'),
        priority: normalizeText(item.priority, 'medium'),
        dependsOn: Array.isArray(item.dependsOn) ? item.dependsOn : [],
        createdAt: item.createdAt || nowIso(),
        updatedAt: nowIso()
      }))
    : buildSubtasks(title);

  const goal = {
    id: `goal-${slugify(title)}-${Date.now()}`,
    slug: slugify(title),
    title,
    summary,
    status: 'active',
    priority: normalizeText(input.priority, 'high'),
    source: normalizeText(input.source, 'manual'),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    subtasks,
    progress: scoreGoal({ subtasks })
  };

  bucket.goals = [goal, ...(bucket.goals || []).map((item) => ({ ...item, status: item.status === 'active' ? 'queued' : item.status }))].slice(0, 20);
  bucket.activeGoalId = goal.id;
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();

  safeWrite(state);

  return {
    ok: true,
    userId,
    goal: clone(goal),
    goalsState: getGoalsState({ userId })
  };
}

export function rebuildGoal(input = {}) {
  const state = safeRead();
  const userId = String(input.userId || 'luiz');
  const bucket = ensureUserBucket(state, userId);
  const ref = normalizeText(input.goalId || bucket.activeGoalId, '');
  const target = (bucket.goals || []).find((goal) => goal.id === ref) || (bucket.goals || [])[0];
  if (!target) {
    return { ok: false, error: 'Nenhuma meta encontrada para reconstruir.' };
  }

  target.subtasks = buildSubtasks(target.title);
  target.updatedAt = nowIso();
  target.progress = scoreGoal(target);
  target.summary = `Meta reconstruída com roadmap básico para ${target.title}.`;
  bucket.activeGoalId = target.id;
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    goal: clone(target),
    goalsState: getGoalsState({ userId })
  };
}

export function markGoalSubtask({ userId = 'luiz', goalId, subtaskId, status = 'done' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const goal = (bucket.goals || []).find((item) => item.id === goalId || item.id === bucket.activeGoalId);
  if (!goal) return { ok: false, error: 'Meta não encontrada.' };

  goal.subtasks = (goal.subtasks || []).map((subtask) => (
    subtask.id === subtaskId
      ? { ...subtask, status: normalizeText(status, subtask.status), updatedAt: nowIso() }
      : subtask
  ));
  goal.progress = scoreGoal(goal);
  goal.updatedAt = nowIso();
  goal.status = goal.progress >= 100 ? 'done' : 'active';
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();
  safeWrite(state);

  return { ok: true, goal: clone(goal), goalsState: getGoalsState({ userId }) };
}
