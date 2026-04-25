import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getGlobalSupervisorState } from './global-supervisor.service.js';
import { getControlledExpansionState } from './controlled-expansion.service.js';
import { getEvolutionModeState } from './evolution-mode.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'resource-optimizer-state.json');

const DEFAULT_STATE = {
  version: '9.0.0',
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
function makeId(prefix='resource-run') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      optimizationScore: 0,
      resourcePressure: 'medium',
      allocationMode: 'balanced',
      recommendedAction: 'Reduzir desperdício e priorizar execução central.',
      savingsEstimate: 0,
      activeConstraints: [],
      activeAllocations: [],
      deferredWork: [],
      planAccepted: false,
      runCount: 0,
      lastOptimizationSummary: 'Nenhuma otimização de recursos executada ainda.',
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

export function getResourceOptimizerState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runResourceOptimizer({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const roadmapState = getExecutionRoadmapState({ userId });
  const feedbackState = getFeedbackLoopState({ userId });
  const supervisorState = getGlobalSupervisorState({ userId });
  const expansionState = getControlledExpansionState({ userId });
  const modeState = getEvolutionModeState({ userId });

  const blockedActions = Number((roadmapState?.blockedActions || []).length || 0);
  const failures = Number(feedbackState?.totals?.failures || 0);
  const successes = Number(feedbackState?.totals?.successes || 0);
  const expansionScore = Number(expansionState?.expansionScore || 0);
  const supervisorScore = Number(supervisorState?.supervisorScore || 0);

  const resourcePressure = blockedActions >= 3 || failures > successes
    ? 'high'
    : expansionScore >= 75 && supervisorScore >= 70
      ? 'low'
      : 'medium';

  const optimizationScore = Math.max(0, Math.min(100, Math.round(
    (supervisorScore * 0.35) +
    (Math.max(successes - failures, 0) * 10) +
    (expansionScore * 0.2) +
    (Number(roadmapState?.progress || 0) * 0.25) -
    (blockedActions * 10)
  )));

  const allocationMode = resourcePressure === 'high'
    ? 'protect_core'
    : String(modeState?.selectedMode || 'safe') === 'aggressive'
      ? 'accelerate_growth'
      : 'balanced';

  const activeAllocations = [
    `Meta ativa: ${(roadmapState?.nextAction?.title || roadmapState?.currentAction?.title || 'sem ação imediata')}`,
    `Supervisor: ${(supervisorState?.recommendedDirective || 'sem diretriz')}`,
    `Expansão: ${(expansionState?.expansionTrack || expansionState?.recommendedTrack || 'base')}`
  ];

  const activeConstraints = [];
  if (blockedActions > 0) activeConstraints.push(`Bloqueios no roadmap: ${blockedActions}`);
  if (failures > successes) activeConstraints.push('Falhas recentes acima dos sucessos.');
  if ((supervisorState?.blockers || []).length) activeConstraints.push('Supervisor global detectou bloqueios.');

  const deferredWork = [
    ...(blockedActions > 0 ? (roadmapState?.blockedActions || []).slice(0, 3).map((item) => item?.title || item?.label || 'Ação bloqueada') : []),
    ...(resourcePressure === 'high' ? ['Expansão agressiva', 'Execução paralela não essencial'] : [])
  ].slice(0, 5);

  const savingsEstimate = Math.max(5, Math.min(80, (blockedActions * 8) + (resourcePressure === 'high' ? 20 : 10)));
  const recommendedAction = resourcePressure === 'high'
    ? 'Reduzir expansão, desbloquear roadmap e priorizar o núcleo estável.'
    : optimizationScore >= 75
      ? 'Acelerar entrega da próxima ação com expansão controlada.'
      : 'Manter alocação balanceada e consolidar progresso antes de expandir.';

  const planAccepted = resourcePressure !== 'high' || optimizationScore >= 65;

  bucket.optimizationScore = optimizationScore;
  bucket.resourcePressure = resourcePressure;
  bucket.allocationMode = allocationMode;
  bucket.recommendedAction = recommendedAction;
  bucket.savingsEstimate = savingsEstimate;
  bucket.activeConstraints = activeConstraints;
  bucket.activeAllocations = activeAllocations;
  bucket.deferredWork = deferredWork;
  bucket.planAccepted = planAccepted;
  bucket.runCount = Number(bucket.runCount || 0) + 1;
  bucket.lastOptimizationSummary = `Modo ${allocationMode}. Pressão ${resourcePressure}. Economia estimada ${savingsEstimate}%.`;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId(),
    source,
    optimizationScore,
    resourcePressure,
    allocationMode,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getResourceOptimizerState({ userId }),
    inputs: {
      roadmapState,
      feedbackState,
      supervisorState,
      expansionState,
      modeState
    }
  };
}
