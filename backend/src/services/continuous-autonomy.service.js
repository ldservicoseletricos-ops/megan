import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getAutonomyState } from './autonomy-core.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getGlobalSupervisorState } from './global-supervisor.service.js';
import { getEvolutionGovernanceState } from './evolution-governance.service.js';
import { getEvolutionModeState } from './evolution-mode.service.js';
import { getResourceOptimizerState, runResourceOptimizer } from './resource-optimizer.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'continuous-autonomy-state.json');

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
function makeId(prefix='autonomy-run') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      autonomyMode: 'guided_continuous',
      cadence: 'controlled',
      autonomyScore: 0,
      currentDirective: 'Consolidar base antes de ampliar autonomia.',
      currentFocus: 'stability',
      nextCycleAction: 'Aguardar nova avaliação.',
      stopReasons: [],
      operatingWindow: 'guarded_window',
      loopReady: false,
      optimizerAligned: false,
      cycleCount: 0,
      lastCycleSummary: 'Nenhum ciclo contínuo executado ainda.',
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

export function getContinuousAutonomyState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runContinuousAutonomy({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const autonomyState = getAutonomyState({ userId });
  const roadmapState = getExecutionRoadmapState({ userId });
  const supervisorState = getGlobalSupervisorState({ userId });
  const governanceState = getEvolutionGovernanceState({ userId });
  const modeState = getEvolutionModeState({ userId });
  const optimizerResult = runResourceOptimizer({ userId, source: 'continuous_autonomy' });
  const optimizerState = optimizerResult?.state || getResourceOptimizerState({ userId });

  const supervisorScore = Number(supervisorState?.supervisorScore || 0);
  const governanceScore = Number(governanceState?.governanceScore || 0);
  const optimizerScore = Number(optimizerState?.optimizationScore || 0);
  const roadmapProgress = Number(roadmapState?.progress || 0);
  const blockedActions = Number((roadmapState?.blockedActions || []).length || 0);
  const stopReasons = [];

  if ((supervisorState?.blockers || []).length) stopReasons.push(...supervisorState.blockers.map((item) => String(item)));
  if ((governanceState?.blockers || []).length) stopReasons.push(...governanceState.blockers.map((item) => String(item)));
  if (blockedActions > 0) stopReasons.push(`Existem ${blockedActions} ação(ões) bloqueada(s) no roadmap.`);
  if (optimizerState?.resourcePressure === 'high') stopReasons.push('Pressão de recursos alta.');

  const autonomyScore = Math.max(0, Math.min(100, Math.round(
    (supervisorScore * 0.35) +
    (governanceScore * 0.25) +
    (optimizerScore * 0.2) +
    (roadmapProgress * 0.2) -
    (blockedActions * 8)
  )));

  const selectedMode = String(modeState?.selectedMode || 'safe');
  const cadence = selectedMode === 'aggressive'
    ? autonomyScore >= 75 ? 'accelerated' : 'guarded'
    : selectedMode === 'supervised'
      ? autonomyScore >= 65 ? 'supervised' : 'controlled'
      : autonomyScore >= 70 ? 'controlled' : 'guarded';

  const loopReady = stopReasons.length === 0 && autonomyScore >= 60;
  const currentFocus = blockedActions > 0
    ? 'unblock_roadmap'
    : optimizerScore < 60
      ? 'optimize_resources'
      : roadmapState?.nextAction?.title
        ? 'execute_next_action'
        : 'stabilize_runtime';

  const nextCycleAction = roadmapState?.nextAction?.title
    || autonomyState?.nextStep
    || optimizerState?.recommendedAction
    || 'Executar nova avaliação global';

  const operatingWindow = loopReady
    ? cadence === 'accelerated' ? 'release_ready' : 'controlled_window'
    : 'guarded_window';

  const currentDirective = loopReady
    ? `Operar autonomia contínua em modo ${cadence} com foco em ${currentFocus}.`
    : `Manter autonomia protegida até eliminar bloqueios e elevar score acima do limite.`;

  bucket.autonomyMode = `continuous_${selectedMode}`;
  bucket.cadence = cadence;
  bucket.autonomyScore = autonomyScore;
  bucket.currentDirective = currentDirective;
  bucket.currentFocus = currentFocus;
  bucket.nextCycleAction = nextCycleAction;
  bucket.stopReasons = Array.from(new Set(stopReasons)).slice(0, 8);
  bucket.operatingWindow = operatingWindow;
  bucket.loopReady = loopReady;
  bucket.optimizerAligned = Boolean(optimizerState?.planAccepted);
  bucket.cycleCount = Number(bucket.cycleCount || 0) + 1;
  bucket.lastCycleSummary = `Score ${autonomyScore}. Janela ${operatingWindow}. Próxima ação: ${nextCycleAction}.`;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId(),
    source,
    autonomyScore,
    cadence,
    loopReady,
    nextCycleAction,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getContinuousAutonomyState({ userId }),
    inputs: {
      autonomyState,
      roadmapState,
      supervisorState,
      governanceState,
      modeState,
      optimizerState
    }
  };
}
