import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getTacticalAdjusterState } from './tactical-adjuster.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getGoalsState } from './goal-decomposer.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'improvement-proposals-state.json');
const CONSENSUS_STATE_PATH = path.join(DATA_DIR, 'consensus-engine-state.json');
const LEARNING_STATE_PATH = path.join(DATA_DIR, 'self-learning-fusion-state.json');

const DEFAULT_STATE = {
  version: '5.0.0',
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


function readUserStateFile(filePath, userId = 'luiz', fallback = {}) {
  try {
    if (!fs.existsSync(filePath)) return structuredClone(fallback);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (raw?.users && raw.users[userId]) return raw.users[userId];
    return raw;
  } catch {
    return structuredClone(fallback);
  }
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
      activeFocus: 'stabilize_runtime',
      proposals: [],
      lastGeneratedAt: null,
      lastAppliedProposalId: null,
      proposalStats: {
        totalGenerated: 0,
        totalApplied: 0,
        totalSafe: 0
      },
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function pushProposal(proposals, proposal) {
  if (!proposal || !proposal.title) return;
  proposals.push({
    id: proposal.id || `proposal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: String(proposal.type || 'improvement'),
    title: String(proposal.title),
    rationale: String(proposal.rationale || 'Sem rationale'),
    source: String(proposal.source || 'system'),
    priority: String(proposal.priority || 'medium'),
    impact: String(proposal.impact || 'medium'),
    confidence: Number(proposal.confidence || 60),
    safeToApply: Boolean(proposal.safeToApply),
    suggestedAction: String(proposal.suggestedAction || proposal.title),
    createdAt: nowIso(),
    status: 'proposed'
  });
}

function buildProposals({ feedback, tactical, consensus, learning, roadmap, goals }) {
  const proposals = [];
  const topFailure = feedback?.topFailureReasons?.[0];
  const activeGoalTitle = goals?.activeGoal?.title || goals?.activeGoal?.objective || 'meta ativa';
  const nextActionTitle = roadmap?.nextAction?.title || roadmap?.currentAction?.title || 'próxima ação';
  const consensusStatus = String(consensus?.consensusStatus || consensus?.status || 'unknown').toLowerCase();
  const tacticalMode = String(tactical?.mode || 'balanced');
  const learningItems = Array.isArray(learning?.recentLearnings) ? learning.recentLearnings : [];
  const failedActions = Array.isArray(roadmap?.failedActions) ? roadmap.failedActions : [];

  if ((feedback?.failureCount || 0) >= 2) {
    pushProposal(proposals, {
      type: 'stability_patch',
      title: 'Criar ciclo de estabilização antes de avançar',
      rationale: topFailure?.reason
        ? `Falha recorrente detectada: ${topFailure.reason}`
        : 'Falhas recentes indicam necessidade de estabilização.',
      source: 'feedback_loop',
      priority: 'high',
      impact: 'high',
      confidence: 88,
      safeToApply: true,
      suggestedAction: 'Bloquear avanço agressivo e criar ação de recuperação'
    });
  }

  if (consensusStatus.includes('blocked') || consensusStatus.includes('weak')) {
    pushProposal(proposals, {
      type: 'consensus_rebuild',
      title: 'Reconstruir consenso antes da próxima execução',
      rationale: 'O consenso entre os cérebros ainda está fraco ou bloqueado.',
      source: 'consensus_engine',
      priority: 'high',
      impact: 'medium',
      confidence: 82,
      safeToApply: true,
      suggestedAction: 'Executar novo consenso com foco em risco e memória'
    });
  }

  if ((feedback?.successRate || 0) >= 60 && failedActions.length === 0) {
    pushProposal(proposals, {
      type: 'accelerate_focus',
      title: `Acelerar execução da meta: ${activeGoalTitle}`,
      rationale: 'A taxa de sucesso recente permite avançar com segurança controlada.',
      source: 'feedback_loop',
      priority: 'medium',
      impact: 'high',
      confidence: 76,
      safeToApply: false,
      suggestedAction: `Reforçar a próxima ação do roadmap: ${nextActionTitle}`
    });
  }

  if (tacticalMode === 'stabilize') {
    pushProposal(proposals, {
      type: 'scope_reduce',
      title: 'Reduzir escopo do ciclo atual',
      rationale: 'O tactical adjuster entrou em modo de estabilização.',
      source: 'tactical_adjuster',
      priority: 'high',
      impact: 'medium',
      confidence: 84,
      safeToApply: true,
      suggestedAction: 'Executar menos passos por ciclo e validar cada etapa'
    });
  }

  if (learningItems.length > 0) {
    const latest = learningItems[0];
    pushProposal(proposals, {
      type: 'codify_learning',
      title: 'Transformar aprendizado recente em regra operacional',
      rationale: `Há aprendizado recente que pode virar padrão reutilizável: ${latest?.title || latest?.lesson || 'novo learning'}.`,
      source: 'learning_loop',
      priority: 'medium',
      impact: 'medium',
      confidence: 72,
      safeToApply: true,
      suggestedAction: 'Registrar regra e usar como heurística do próximo ciclo'
    });
  }

  if (!proposals.length) {
    pushProposal(proposals, {
      type: 'maintain_focus',
      title: `Manter foco controlado em ${activeGoalTitle}`,
      rationale: 'O sistema está estável, mas ainda sem sinal forte para ajuste estrutural.',
      source: 'system',
      priority: 'medium',
      impact: 'medium',
      confidence: 65,
      safeToApply: true,
      suggestedAction: `Seguir o roadmap atual com atenção à ação: ${nextActionTitle}`
    });
  }

  return proposals
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

export function getImprovementProposalsState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function generateImprovementProposals({ userId = 'luiz' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const feedback = getFeedbackLoopState({ userId });
  const tactical = getTacticalAdjusterState({ userId });
  const consensus = readUserStateFile(CONSENSUS_STATE_PATH, userId, {});
  const learning = readUserStateFile(LEARNING_STATE_PATH, userId, {});
  const roadmap = getExecutionRoadmapState({ userId });
  const goals = getGoalsState({ userId });

  const proposals = buildProposals({ feedback, tactical, consensus, learning, roadmap, goals });

  bucket.proposals = proposals;
  bucket.activeFocus = proposals[0]?.type || 'maintain_focus';
  bucket.lastGeneratedAt = nowIso();
  bucket.proposalStats.totalGenerated += proposals.length;
  bucket.proposalStats.totalSafe += proposals.filter((item) => item.safeToApply).length;
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();

  safeWrite(state);
  return { ok: true, state: getImprovementProposalsState({ userId }) };
}

export function markImprovementProposalApplied({ userId = 'luiz', proposalId } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const proposal = (bucket.proposals || []).find((item) => item.id === proposalId);
  if (!proposal) {
    return { ok: false, error: 'Proposta não encontrada' };
  }

  proposal.status = 'applied';
  proposal.appliedAt = nowIso();
  bucket.lastAppliedProposalId = proposal.id;
  bucket.proposalStats.totalApplied += 1;
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();
  safeWrite(state);

  return { ok: true, proposal: clone(proposal), state: getImprovementProposalsState({ userId }) };
}
