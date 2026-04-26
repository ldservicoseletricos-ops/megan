import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getAdvancedMemoryState } from './advanced-memory.service.js';
import { getDecisionMemoryState } from './decision-memory.service.js';
import { listPriorityQueue } from './priority-queue.service.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getTacticalAdjusterState } from './tactical-adjuster.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getGoalsState } from './goal-decomposer.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'brain-coordinator-state.json');

const DEFAULT_STATE = {
  version: '4.0.0',
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
      leadBrain: 'operational',
      leadReason: 'Aguardando contexto suficiente',
      supportBrains: [],
      observers: [],
      riskLevel: 'controlled',
      confidence: 0,
      blockers: [],
      coordinationSummary: 'Sem coordenação calculada ainda.',
      consultedModules: [],
      cycleCount: 0,
      history: [],
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
  }
  return state.users[userId];
}

function unique(list = []) {
  return [...new Set((list || []).filter(Boolean))];
}

function buildCoordination({ feedback, roadmap, goals, queue, decisionMemory, advancedMemory, tactical }) {
  const currentAction = roadmap?.currentAction?.title || roadmap?.nextAction?.title || '';
  const activeGoal = goals?.activeGoal?.title || advancedMemory?.activeObjective || '';
  const failureCount = Number(feedback?.failureCount || 0);
  const successRate = Number(feedback?.successRate || 0);
  const topQueue = (queue?.items || [])[0]?.title || '';
  const stableBrain = decisionMemory?.lastStableBrain || '';
  const tacticalMode = tactical?.mode || 'balanced';

  let leadBrain = 'operational';
  let leadReason = 'Sem conflitos relevantes, mantendo execução operacional.';
  let confidence = 82;
  let riskLevel = 'controlled';
  const supportBrains = [];
  const observers = ['feedback_loop'];
  const blockers = [];

  if (failureCount >= 2) {
    leadBrain = 'stability_guard';
    leadReason = 'Falhas recentes exigem estabilização antes de acelerar novas ações.';
    confidence = 91;
    riskLevel = 'elevated';
    supportBrains.push('tactical_adjuster', 'decision_memory');
    blockers.push('Evitar repetir ação falhada sem ajuste explícito.');
  } else if ((goals?.activeGoal?.progress || 0) < 40 && activeGoal) {
    leadBrain = 'strategic';
    leadReason = 'Meta ativa com progresso baixo pede coordenação estratégica do roadmap.';
    confidence = 88;
    supportBrains.push('goal_decomposer', 'execution_priority');
  } else if (currentAction || topQueue) {
    leadBrain = 'technical';
    leadReason = 'Há ação concreta na fila/roadmap e o foco atual é execução coordenada.';
    confidence = 86;
    supportBrains.push('execution_priority', 'memory_core');
  }

  if (stableBrain && stableBrain !== leadBrain) {
    observers.push(stableBrain);
  }

  if (successRate >= 70 && tacticalMode === 'accelerate') {
    supportBrains.push('learning_loop');
    leadReason += ' Taxa de sucesso recente permite avanço com aprendizado reforçado.';
    confidence = Math.min(96, confidence + 4);
  }

  if (advancedMemory?.avoidList?.length) {
    blockers.push(`Respeitar avoid list ativa (${advancedMemory.avoidList.length} item(ns)).`);
  }

  const consultedModules = unique([
    'memory_core',
    'decision_memory',
    'execution_priority',
    'learning_loop',
    'goal_decomposer',
    'execution_roadmap',
    'tactical_adjuster',
    'feedback_loop',
    ...supportBrains,
    ...observers
  ]);

  const coordinationSummary = [
    `Cérebro líder: ${leadBrain}.`,
    activeGoal ? `Meta ativa: ${activeGoal}.` : 'Sem meta ativa consolidada.',
    currentAction ? `Ação foco: ${currentAction}.` : topQueue ? `Fila indica: ${topQueue}.` : 'Sem ação prioritária explícita.',
    failureCount > 0 ? `Falhas recentes: ${failureCount}.` : 'Sem falhas recentes relevantes.'
  ].join(' ');

  return {
    leadBrain,
    leadReason,
    supportBrains: unique(supportBrains),
    observers: unique(observers),
    riskLevel,
    confidence,
    blockers: unique(blockers),
    consultedModules,
    coordinationSummary
  };
}

export async function getBrainCoordinatorState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export async function runBrainCoordination({ userId = 'luiz', source = 'manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const [advancedMemory, decisionMemory] = await Promise.all([
    getAdvancedMemoryState(),
    getDecisionMemoryState()
  ]);
  const queue = listPriorityQueue({ userId });
  const feedback = getFeedbackLoopState({ userId });
  const tactical = getTacticalAdjusterState({ userId });
  const roadmap = getExecutionRoadmapState({ userId });
  const goals = getGoalsState({ userId });

  const coordination = buildCoordination({
    feedback,
    roadmap,
    goals,
    queue,
    decisionMemory,
    advancedMemory,
    tactical
  });

  Object.assign(bucket, coordination, {
    cycleCount: Number(bucket.cycleCount || 0) + 1,
    updatedAt: nowIso(),
    history: [
      {
        createdAt: nowIso(),
        source,
        leadBrain: coordination.leadBrain,
        confidence: coordination.confidence,
        riskLevel: coordination.riskLevel,
        leadReason: coordination.leadReason
      },
      ...(bucket.history || [])
    ].slice(0, 30)
  });

  state.updatedAt = nowIso();
  safeWrite(state);
  return { ok: true, state: clone(bucket) };
}
