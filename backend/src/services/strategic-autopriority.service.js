import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { listPriorityQueue } from './priority-queue.service.js';
import { getStrategicReviewState } from './strategic-review.service.js';
import { getResourceOptimizerState } from './resource-optimizer.service.js';
import { getMissionContinuityState } from './mission-continuity.service.js';
import { getGlobalSupervisorState } from './global-supervisor.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'strategic-autopriority-state.json');

const DEFAULT_STATE = {
  version: '10.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }); }
function nowIso() { return new Date().toISOString(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
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
function makeId(prefix='autopriority-run') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      autopriorityScore: 0,
      priorityMode: 'balanced',
      highestPriorityMission: 'Nenhuma prioridade estratégica calculada.',
      recommendedSequence: [],
      droppedPriorities: [],
      strategicWeights: {},
      topSignals: [],
      recommendedAction: 'Rodar a autopriorização para definir a próxima frente.',
      alignmentStatus: 'unknown',
      focusWindow: 'next_cycle',
      runCount: 0,
      lastAutoprioritySummary: 'Nenhuma autoprioridade estratégica executada ainda.',
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function asItemTitle(item) {
  if (!item) return 'Item estratégico';
  if (typeof item === 'string') return item;
  return item.title || item.label || item.goal || item.name || 'Item estratégico';
}

export function getStrategicAutopriorityState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runStrategicAutopriority({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const priorityState = listPriorityQueue({ userId, includeDone: true });
  const strategicReviewState = getStrategicReviewState({ userId });
  const resourceOptimizerState = getResourceOptimizerState({ userId });
  const missionContinuityState = getMissionContinuityState({ userId });
  const supervisorState = getGlobalSupervisorState({ userId });

  const queueItems = Array.isArray(priorityState?.queue) ? priorityState.queue : [];
  const reviewPriorities = Array.isArray(strategicReviewState?.priorityList) ? strategicReviewState.priorityList : [];
  const reviewOpportunities = Array.isArray(strategicReviewState?.opportunities) ? strategicReviewState.opportunities : [];
  const optimizationScore = Number(resourceOptimizerState?.optimizationScore || 0);
  const continuityScore = Number(missionContinuityState?.continuityScore || 0);
  const supervisorScore = Number(supervisorState?.supervisorScore || 0);

  const strategicWeights = {
    continuity: continuityScore,
    optimization: optimizationScore,
    supervision: supervisorScore,
    readiness: Number(strategicReviewState?.readinessScore || 0)
  };

  const recommendedSequence = [
    ...reviewPriorities.map((item) => asItemTitle(item)),
    ...queueItems.map((item) => asItemTitle(item)),
    ...reviewOpportunities.map((item) => asItemTitle(item))
  ].filter(Boolean).filter((item, index, list) => list.indexOf(item) === index).slice(0, 6);

  const highestPriorityMission = recommendedSequence[0] || missionContinuityState?.activeMission || 'Definir uma missão principal';
  const droppedPriorities = queueItems.slice(6).map((item) => asItemTitle(item)).slice(0, 5);

  const autopriorityScore = Math.max(0, Math.min(100, Math.round(
    (continuityScore * 0.35) +
    (optimizationScore * 0.2) +
    (supervisorScore * 0.25) +
    (Number(strategicReviewState?.readinessScore || 0) * 0.2)
  )));

  const priorityMode = autopriorityScore >= 80
    ? 'accelerated'
    : optimizationScore < 50 || continuityScore < 50
      ? 'stabilize'
      : 'balanced';

  const alignmentStatus = autopriorityScore >= 75
    ? 'aligned'
    : autopriorityScore >= 50
      ? 'partial'
      : 'drifting';

  const topSignals = [
    `Continuidade ${continuityScore}`,
    `Otimização ${optimizationScore}`,
    `Supervisão ${supervisorScore}`,
    `Readiness ${Number(strategicReviewState?.readinessScore || 0)}`
  ];

  const focusWindow = priorityMode === 'accelerated'
    ? 'next_72_hours'
    : priorityMode === 'stabilize'
      ? 'current_cycle'
      : 'next_week';

  const recommendedAction = priorityMode === 'stabilize'
    ? 'Reduzir frentes paralelas e concentrar recursos no núcleo da missão.'
    : priorityMode === 'accelerated'
      ? 'Acelerar a missão principal e preparar a próxima expansão estratégica.'
      : 'Manter a sequência recomendada e revisar alinhamento ao fim do ciclo.';

  bucket.autopriorityScore = autopriorityScore;
  bucket.priorityMode = priorityMode;
  bucket.highestPriorityMission = highestPriorityMission;
  bucket.recommendedSequence = recommendedSequence;
  bucket.droppedPriorities = droppedPriorities;
  bucket.strategicWeights = strategicWeights;
  bucket.topSignals = topSignals;
  bucket.recommendedAction = recommendedAction;
  bucket.alignmentStatus = alignmentStatus;
  bucket.focusWindow = focusWindow;
  bucket.runCount = Number(bucket.runCount || 0) + 1;
  bucket.lastAutoprioritySummary = `Modo ${priorityMode}. Missão principal: ${highestPriorityMission}. Alinhamento ${alignmentStatus}.`;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId(),
    source,
    autopriorityScore,
    priorityMode,
    alignmentStatus,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getStrategicAutopriorityState({ userId }),
    inputs: { priorityState, strategicReviewState, resourceOptimizerState, missionContinuityState, supervisorState }
  };
}
