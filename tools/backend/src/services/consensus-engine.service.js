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
import { getBrainCoordinatorState, runBrainCoordination } from './brain-coordinator.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'consensus-engine-state.json');

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
      decision: 'review',
      consensusScore: 0,
      approvedAction: null,
      coordinationLeadBrain: 'operational',
      rationale: [],
      votes: [],
      conflicts: [],
      blockers: [],
      updatedAt: nowIso(),
      createdAt: nowIso(),
      history: []
    };
  }
  return state.users[userId];
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function makeVote(module, stance, reason, weight) {
  return { module, stance, reason, weight };
}

function summarizeDecision(score, conflicts = [], blockers = []) {
  if (blockers.length) return 'blocked';
  if (score >= 75 && !conflicts.length) return 'approve';
  if (score >= 55) return 'adjust';
  return 'review';
}

export async function getConsensusEngineState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export async function runConsensusEvaluation({ userId = 'luiz', source = 'manual' } = {}) {
  await runBrainCoordination({ userId, source: `consensus:${source}` });
  const coordinator = await getBrainCoordinatorState({ userId });
  const [advancedMemory, decisionMemory] = await Promise.all([
    getAdvancedMemoryState(),
    getDecisionMemoryState()
  ]);
  const queue = listPriorityQueue({ userId });
  const feedback = getFeedbackLoopState({ userId });
  const tactical = getTacticalAdjusterState({ userId });
  const roadmap = getExecutionRoadmapState({ userId });
  const goals = getGoalsState({ userId });

  const actionTitle = roadmap?.currentAction?.title || roadmap?.nextAction?.title || queue?.items?.[0]?.title || goals?.activeGoal?.title || null;
  const votes = [];
  const conflicts = [];
  const blockers = [...(coordinator?.blockers || [])];
  let score = 50;

  if (actionTitle) {
    votes.push(makeVote('execution_roadmap', 'approve', `Há ação candidata: ${actionTitle}.`, 18));
    score += 18;
  } else {
    votes.push(makeVote('execution_roadmap', 'review', 'Nenhuma ação candidata explícita.', -10));
    score -= 10;
  }

  if ((feedback?.failureCount || 0) >= 2) {
    votes.push(makeVote('feedback_loop', 'block', 'Falhas recorrentes recentes exigem cuidado.', -28));
    blockers.push('Feedback loop sinaliza falhas recorrentes.');
    score -= 28;
  } else if ((feedback?.successRate || 0) >= 60) {
    votes.push(makeVote('feedback_loop', 'approve', 'Taxa de sucesso recente favorável.', 14));
    score += 14;
  }

  if ((advancedMemory?.avoidList || []).length > 0) {
    votes.push(makeVote('memory_core', 'warn', 'Existe avoid list ativa no contexto.', -12));
    conflicts.push('Contexto de memória contém itens de evitação ativos.');
    score -= 12;
  } else {
    votes.push(makeVote('memory_core', 'approve', 'Nenhum bloqueio forte na memória operacional.', 8));
    score += 8;
  }

  if (decisionMemory?.lastStableValidation) {
    votes.push(makeVote('decision_memory', 'approve', `Validação estável registrada: ${decisionMemory.lastStableValidation}.`, 10));
    score += 10;
  } else {
    votes.push(makeVote('decision_memory', 'review', 'Sem validação estável consolidada.', -4));
    score -= 4;
  }

  if (tactical?.mode === 'stabilize') {
    votes.push(makeVote('tactical_adjuster', 'adjust', 'Modo de estabilização recomenda reduzir agressividade.', -10));
    conflicts.push('Tactical adjuster pede estabilização antes de acelerar.');
    score -= 10;
  } else if (tactical?.mode === 'accelerate') {
    votes.push(makeVote('tactical_adjuster', 'approve', 'Modo accelerate favorece avanço controlado.', 10));
    score += 10;
  }

  if (coordinator?.riskLevel === 'elevated') {
    votes.push(makeVote('brain_coordinator', 'warn', 'Coordenação detectou risco elevado.', -12));
    conflicts.push('Brain coordinator marcou risco elevado.');
    score -= 12;
  } else {
    votes.push(makeVote('brain_coordinator', 'approve', `Liderança atual: ${coordinator?.leadBrain || 'operational'}.`, 8));
    score += 8;
  }

  score = clamp(score);
  const decision = summarizeDecision(score, conflicts, blockers);
  const rationale = [
    coordinator?.coordinationSummary || 'Sem resumo de coordenação.',
    actionTitle ? `Ação avaliada: ${actionTitle}.` : 'Nenhuma ação principal definida.',
    `Score final de consenso: ${score}.`,
    decision === 'approve'
      ? 'Consenso suficiente para avançar.'
      : decision === 'adjust'
      ? 'Consenso parcial: avançar só com ajuste.'
      : decision === 'blocked'
      ? 'Ação bloqueada por conflito crítico.'
      : 'Consenso insuficiente: revisar antes de executar.'
  ];

  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  Object.assign(bucket, {
    decision,
    consensusScore: score,
    approvedAction: actionTitle,
    coordinationLeadBrain: coordinator?.leadBrain || 'operational',
    rationale,
    votes,
    conflicts: [...new Set(conflicts)].slice(0, 6),
    blockers: [...new Set(blockers)].slice(0, 6),
    updatedAt: nowIso(),
    history: [
      {
        createdAt: nowIso(),
        source,
        decision,
        consensusScore: score,
        approvedAction: actionTitle,
        leadBrain: coordinator?.leadBrain || 'operational'
      },
      ...(bucket.history || [])
    ].slice(0, 30)
  });

  state.updatedAt = nowIso();
  safeWrite(state);
  return { ok: true, state: clone(bucket) };
}
