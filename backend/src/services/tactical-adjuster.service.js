import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getGoalsState } from './goal-decomposer.service.js';
import { listPriorityQueue, addPriorityQueueItem, updatePriorityQueueItem } from './priority-queue.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'tactical-adjuster-state.json');

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureUserBucket(state, userId = 'luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      mode: 'balanced',
      lastAction: 'Aguardando sinais',
      currentAdjustment: null,
      recommendations: [],
      appliedAdjustments: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function buildRecommendations({ feedback, roadmap, goals, queue }) {
  const recommendations = [];
  const topFailure = feedback?.topFailureReasons?.[0]?.reason || '';
  if ((feedback?.failureCount || 0) >= 2) {
    recommendations.push({
      type: 'reduce_scope',
      title: 'Reduzir escopo do ciclo atual',
      reason: topFailure || 'Falhas repetidas no loop recente',
      level: 'urgent_important'
    });
  }
  if ((feedback?.successRate || 0) >= 60 && roadmap?.nextAction?.title) {
    recommendations.push({
      type: 'reinforce_next_action',
      title: `Reforçar próxima ação: ${roadmap.nextAction.title}`,
      reason: 'Taxa de sucesso recente suficiente para avançar',
      level: 'strategic'
    });
  }
  if ((roadmap?.failedActions || []).length > 0) {
    recommendations.push({
      type: 'recover_failed_action',
      title: 'Criar ação de recuperação para etapa falhada',
      reason: (roadmap.failedActions || []).slice(-1)[0]?.blockedReason || 'Há ação falhada no roadmap',
      level: 'urgent'
    });
  }
  if (!recommendations.length && goals?.activeGoal?.title) {
    recommendations.push({
      type: 'stabilize_goal',
      title: `Consolidar progresso de ${goals.activeGoal.title}`,
      reason: 'Manter foco na meta ativa enquanto não há desvios fortes',
      level: 'strategic'
    });
  }
  return recommendations.slice(0, 4);
}

export function getTacticalAdjusterState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runTacticalAdjustment({ userId = 'luiz', apply = true } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const feedback = getFeedbackLoopState({ userId });
  const roadmap = getExecutionRoadmapState({ userId });
  const goals = getGoalsState({ userId });
  const queue = listPriorityQueue({ userId });
  const recommendations = buildRecommendations({ feedback, roadmap, goals, queue });
  const primary = recommendations[0] || null;

  if (apply && primary) {
    if (primary.type === 'recover_failed_action') {
      addPriorityQueueItem({
        userId,
        title: 'Recuperar etapa falhada do roadmap',
        type: 'recovery',
        level: primary.level,
        source: 'tactical_adjuster',
        note: primary.reason
      });
    }
    if (primary.type === 'reinforce_next_action' && roadmap?.nextAction?.title) {
      addPriorityQueueItem({
        userId,
        title: roadmap.nextAction.title,
        type: 'reinforcement',
        level: primary.level,
        source: 'tactical_adjuster',
        note: primary.reason
      });
    }
    if (primary.type === 'reduce_scope' && roadmap?.currentAction?.id) {
      updatePriorityQueueItem({ userId, title: roadmap.currentAction.title, status: 'blocked', note: 'Bloqueada temporariamente pelo tactical adjuster' });
    }
  }

  bucket.mode = (feedback?.failureCount || 0) >= 2 ? 'stabilize' : (feedback?.successRate || 0) >= 60 ? 'accelerate' : 'balanced';
  bucket.lastAction = primary?.title || 'Nenhum ajuste necessário neste ciclo';
  bucket.currentAdjustment = primary;
  bucket.recommendations = recommendations;
  bucket.appliedAdjustments = primary ? [{ ...primary, appliedAt: nowIso() }, ...(bucket.appliedAdjustments || [])].slice(0, 20) : bucket.appliedAdjustments || [];
  bucket.updatedAt = nowIso();

  state.updatedAt = nowIso();
  safeWrite(state);

  return { ok: true, state: getTacticalAdjusterState({ userId }) };
}
