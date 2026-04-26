import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getContinuousAutonomyState } from './continuous-autonomy.service.js';
import { getGoalsState } from './goal-decomposer.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getGlobalSupervisorState } from './global-supervisor.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'mission-continuity-state.json');

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
function makeId(prefix='mission-run') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      continuityScore: 0,
      missionStatus: 'idle',
      activeMission: 'Nenhuma missão contínua registrada.',
      missionChain: [],
      nextMilestone: 'Definir uma meta com subtarefas para iniciar a continuidade.',
      interruptionRisk: 'medium',
      resilienceLevel: 'baseline',
      continuityDirective: 'Consolidar meta, roadmap e autonomia contínua.',
      carryOverContext: [],
      blockedDependencies: [],
      resumptionChecklist: [],
      resumeReady: false,
      runCount: 0,
      lastContinuitySummary: 'Nenhuma análise de continuidade executada ainda.',
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

export function getMissionContinuityState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runMissionContinuity({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const goalsState = getGoalsState({ userId });
  const roadmapState = getExecutionRoadmapState({ userId });
  const autonomyState = getContinuousAutonomyState({ userId });
  const supervisorState = getGlobalSupervisorState({ userId });

  const goals = Array.isArray(goalsState?.goals) ? goalsState.goals : [];
  const activeGoal = goals.find((goal) => goal?.status === 'active') || goals[0] || null;
  const roadmapItems = Array.isArray(roadmapState?.items) ? roadmapState.items : [];
  const completedItems = roadmapItems.filter((item) => item?.status === 'done').length;
  const blockedItems = Array.isArray(roadmapState?.blockedActions) ? roadmapState.blockedActions : roadmapItems.filter((item) => item?.status === 'blocked');
  const currentAction = roadmapState?.currentAction || roadmapItems.find((item) => item?.status === 'active') || null;
  const nextAction = roadmapState?.nextAction || roadmapItems.find((item) => item?.status === 'pending') || null;
  const autonomyMomentum = Number(autonomyState?.autonomyScore || autonomyState?.momentumScore || 0);
  const supervisorScore = Number(supervisorState?.supervisorScore || 0);
  const goalProgress = Number(activeGoal?.progress || goalsState?.progress || 0);

  const continuityScore = Math.max(0, Math.min(100, Math.round(
    (goalProgress * 0.35) +
    (Number(roadmapState?.progress || 0) * 0.25) +
    (autonomyMomentum * 0.2) +
    (supervisorScore * 0.2) -
    (blockedItems.length * 8)
  )));

  const missionStatus = blockedItems.length >= 3
    ? 'fragile'
    : continuityScore >= 75
      ? 'stable'
      : continuityScore >= 45
        ? 'advancing'
        : 'restarting';

  const interruptionRisk = blockedItems.length >= 3
    ? 'high'
    : currentAction && nextAction
      ? 'low'
      : 'medium';

  const resilienceLevel = continuityScore >= 80
    ? 'high'
    : continuityScore >= 55
      ? 'moderate'
      : 'baseline';

  const missionChain = [
    activeGoal?.title || activeGoal?.goal || activeGoal?.name || null,
    currentAction?.title || currentAction?.label || null,
    nextAction?.title || nextAction?.label || null
  ].filter(Boolean);

  const blockedDependencies = blockedItems.slice(0, 5).map((item) => item?.title || item?.label || 'Bloqueio registrado');
  const carryOverContext = [
    activeGoal?.summary || activeGoal?.objective || null,
    roadmapState?.summary || roadmapState?.lastProgressSummary || null,
    autonomyState?.lastRunSummary || autonomyState?.recommendedAction || null
  ].filter(Boolean).slice(0, 5);

  const nextMilestone = nextAction?.title || nextAction?.label || activeGoal?.nextStep || 'Concluir a próxima etapa crítica do roadmap.';
  const resumptionChecklist = [
    blockedDependencies.length ? `Resolver ${blockedDependencies.length} bloqueio(s) prioritário(s)` : 'Sem bloqueios críticos',
    currentAction ? `Retomar ação atual: ${currentAction?.title || currentAction?.label}` : 'Selecionar ação atual',
    nextAction ? `Preparar próxima ação: ${nextAction?.title || nextAction?.label}` : 'Gerar próxima ação do roadmap'
  ];

  const continuityDirective = missionStatus === 'fragile'
    ? 'Proteger o núcleo da missão, remover bloqueios e evitar dispersão.'
    : missionStatus === 'stable'
      ? 'Manter execução contínua e antecipar o próximo marco.'
      : 'Reforçar contexto ativo e consolidar a sequência da missão.';

  const resumeReady = blockedDependencies.length === 0 && Boolean(nextMilestone);

  bucket.continuityScore = continuityScore;
  bucket.missionStatus = missionStatus;
  bucket.activeMission = activeGoal?.title || activeGoal?.goal || 'Missão contínua em construção';
  bucket.missionChain = missionChain;
  bucket.nextMilestone = nextMilestone;
  bucket.interruptionRisk = interruptionRisk;
  bucket.resilienceLevel = resilienceLevel;
  bucket.continuityDirective = continuityDirective;
  bucket.carryOverContext = carryOverContext;
  bucket.blockedDependencies = blockedDependencies;
  bucket.resumptionChecklist = resumptionChecklist;
  bucket.resumeReady = resumeReady;
  bucket.runCount = Number(bucket.runCount || 0) + 1;
  bucket.lastContinuitySummary = `Missão ${missionStatus}. Próximo marco: ${nextMilestone}. Risco ${interruptionRisk}.`;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId(),
    source,
    continuityScore,
    missionStatus,
    interruptionRisk,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getMissionContinuityState({ userId }),
    inputs: { goalsState, roadmapState, autonomyState, supervisorState }
  };
}
