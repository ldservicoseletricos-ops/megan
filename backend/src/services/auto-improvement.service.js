import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { generateImprovementProposals, getImprovementProposalsState, markImprovementProposalApplied } from './improvement-proposal.service.js';
import { addPriorityQueueItem } from './priority-queue.service.js';
import { registerFeedback } from './feedback-loop.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'auto-improvement-state.json');

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
      lastRunAt: null,
      mode: 'guided_safe',
      lastRunSummary: 'Ainda não executado',
      lastAppliedProposal: null,
      recentRuns: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function applyProposal({ userId, proposal }) {
  if (!proposal) {
    return { applied: false, summary: 'Nenhuma proposta disponível para aplicar.' };
  }

  if (!proposal.safeToApply) {
    return { applied: false, summary: `Proposta "${proposal.title}" exige validação manual.` };
  }

  addPriorityQueueItem({
    userId,
    title: proposal.suggestedAction || proposal.title,
    type: 'auto_improvement',
    level: proposal.priority === 'high' ? 'strategic' : 'normal',
    source: 'auto_improvement',
    note: proposal.rationale
  });

  registerFeedback({
    userId,
    type: 'auto_improvement',
    outcome: 'success',
    title: proposal.title,
    reason: 'Proposta segura adicionada automaticamente à fila de prioridade.',
    source: 'auto_improvement'
  });

  return {
    applied: true,
    summary: `Proposta aplicada com segurança: ${proposal.title}`
  };
}

export function getAutoImprovementState({ userId = 'luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runAutoImprovement({ userId = 'luiz', regenerate = true } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  if (regenerate) {
    generateImprovementProposals({ userId });
  }

  const proposalsState = getImprovementProposalsState({ userId });
  const proposal = (proposalsState?.proposals || []).find((item) => item.safeToApply) || (proposalsState?.proposals || [])[0] || null;
  const result = applyProposal({ userId, proposal });

  if (result.applied && proposal?.id) {
    markImprovementProposalApplied({ userId, proposalId: proposal.id });
  }

  const runEntry = {
    id: `auto-improvement-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    summary: result.summary,
    proposalTitle: proposal?.title || 'Nenhuma proposta',
    applied: result.applied,
    safeToApply: Boolean(proposal?.safeToApply),
    createdAt: nowIso()
  };

  bucket.lastRunAt = nowIso();
  bucket.lastRunSummary = result.summary;
  bucket.lastAppliedProposal = result.applied ? proposal : null;
  bucket.recentRuns = [runEntry, ...(bucket.recentRuns || [])].slice(0, 20);
  bucket.updatedAt = nowIso();
  state.updatedAt = nowIso();
  safeWrite(state);

  return { ok: true, state: getAutoImprovementState({ userId }), proposalState: getImprovementProposalsState({ userId }) };
}
