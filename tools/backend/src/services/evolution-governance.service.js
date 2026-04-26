import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getBrainCoordinatorState } from './brain-coordinator.service.js';
import { getConsensusEngineState } from './consensus-engine.service.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getAutoImprovementState } from './auto-improvement.service.js';
import { getImprovementProposalsState } from './improvement-proposal.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'evolution-governance-state.json');

const DEFAULT_STATE = {
  version: '6.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function nowIso() { return new Date().toISOString(); }
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
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      governanceMode: 'guided_safe',
      executionPolicy: 'safe_first',
      autonomyLevel: 'assisted',
      approvalThreshold: 72,
      lastDecision: 'Ainda sem decisão de governança.',
      lastReason: 'Nenhuma avaliação executada ainda.',
      policySummary: 'Modo seguro com validação antes de aplicar mudanças de maior impacto.',
      blockers: [],
      allowedActions: ['safe_improvement', 'priority_reorder', 'roadmap_adjustment'],
      restrictedActions: ['aggressive_self_patch', 'destructive_change'],
      recentEvaluations: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function derivePolicy({ mode='guided_safe', consensusState, feedbackState, proposalsState }) {
  const consensus = Number(consensusState?.consensusScore || 0);
  const failures = Number(feedbackState?.totals?.failures || 0);
  const safeProposals = (proposalsState?.proposals || []).filter((item) => item?.safeToApply).length;
  const manualProposals = (proposalsState?.proposals || []).filter((item) => !item?.safeToApply).length;

  if (mode === 'aggressive') {
    return {
      executionPolicy: consensus >= 70 ? 'fast_lane' : 'guarded_aggressive',
      autonomyLevel: consensus >= 70 && failures <= 2 ? 'high' : 'supervised',
      approvalThreshold: consensus >= 70 ? 60 : 75,
      allowedActions: ['safe_improvement', 'priority_reorder', 'roadmap_adjustment', 'consensus_driven_change'],
      restrictedActions: failures > 3 ? ['destructive_change', 'blind_retry'] : ['destructive_change'],
      blockers: manualProposals > safeProposals ? ['Excesso de propostas manuais pendentes.'] : []
    };
  }

  if (mode === 'supervised') {
    return {
      executionPolicy: 'review_before_apply',
      autonomyLevel: 'assisted',
      approvalThreshold: 78,
      allowedActions: ['safe_improvement', 'priority_reorder'],
      restrictedActions: ['aggressive_self_patch', 'destructive_change', 'consensus_driven_change'],
      blockers: manualProposals ? ['Mudanças manuais exigem aprovação explícita.'] : []
    };
  }

  return {
    executionPolicy: 'safe_first',
    autonomyLevel: consensus >= 65 ? 'assisted' : 'guarded',
    approvalThreshold: 72,
    allowedActions: ['safe_improvement', 'priority_reorder', 'roadmap_adjustment'],
    restrictedActions: ['aggressive_self_patch', 'destructive_change', 'blind_retry'],
    blockers: failures > 2 ? ['Falhas recentes exigem cautela adicional.'] : []
  };
}

export function getEvolutionGovernanceState({ userId='luiz' }={}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function evaluateEvolutionGovernance({ userId='luiz', mode }={}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  if (mode) bucket.governanceMode = String(mode);

  const consensusState = getConsensusEngineState({ userId });
  const coordinatorState = getBrainCoordinatorState({ userId });
  const feedbackState = getFeedbackLoopState({ userId });
  const autoImprovementState = getAutoImprovementState({ userId });
  const proposalsState = getImprovementProposalsState({ userId });

  const policy = derivePolicy({ mode: bucket.governanceMode, consensusState, feedbackState, proposalsState });
  const decision = policy.blockers.length
    ? `Governança em ${bucket.governanceMode}: avanço limitado por bloqueios preventivos.`
    : `Governança em ${bucket.governanceMode}: execução liberada dentro da política ${policy.executionPolicy}.`;
  const reason = `Consenso ${Number(consensusState?.consensusScore || 0)} | líder ${coordinatorState?.leadBrain || 'operational'} | falhas ${Number(feedbackState?.totals?.failures || 0)} | auto improvement ${autoImprovementState?.mode || 'guided_safe'}`;

  Object.assign(bucket, policy, {
    lastDecision: decision,
    lastReason: reason,
    policySummary: `Modo ${bucket.governanceMode} com autonomia ${policy.autonomyLevel} e aprovação mínima ${policy.approvalThreshold}.`,
    updatedAt: nowIso()
  });

  const entry = {
    id: `governance-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    mode: bucket.governanceMode,
    decision,
    reason,
    blockers: bucket.blockers,
    createdAt: nowIso()
  };
  bucket.recentEvaluations = [entry, ...(bucket.recentEvaluations || [])].slice(0, 20);
  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getEvolutionGovernanceState({ userId }),
    inputs: {
      coordinatorState,
      consensusState,
      feedbackState,
      proposalsState,
      autoImprovementState
    }
  };
}
