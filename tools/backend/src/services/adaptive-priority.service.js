import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const PRIORITY_FILE = path.join(DATA_DIR, 'adaptive-priority-state.json');

const DEFAULT_STATE = {
  highestPriorityAction: 'monitorar_missao_ativa',
  downgradedActions: [],
  priorityReason: 'Nenhuma priorização adaptativa calculada ainda',
  recentImpact: [],
  actionScores: {
    brain_routing: 50,
    self_healing: 50,
    patch_generation: 50,
    execution_plan: 50,
    fallback_strategy: 50
  },
  updatedAt: null,
  history: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  const actionScores = base.actionScores && typeof base.actionScores === 'object'
    ? base.actionScores
    : DEFAULT_STATE.actionScores;

  return {
    ...DEFAULT_STATE,
    ...base,
    downgradedActions: Array.isArray(base.downgradedActions) ? base.downgradedActions.slice(-10) : [],
    recentImpact: Array.isArray(base.recentImpact) ? base.recentImpact.slice(-20) : [],
    history: Array.isArray(base.history) ? base.history.slice(-20) : [],
    actionScores: {
      brain_routing: Number(actionScores.brain_routing ?? 50),
      self_healing: Number(actionScores.self_healing ?? 50),
      patch_generation: Number(actionScores.patch_generation ?? 50),
      execution_plan: Number(actionScores.execution_plan ?? 50),
      fallback_strategy: Number(actionScores.fallback_strategy ?? 50)
    }
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(PRIORITY_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getAdaptivePriorityState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(PRIORITY_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

function scoreActions(autonomyState, previousScores) {
  const scores = { ...previousScores };
  const validationScore = Number(autonomyState?.validationScore || 0);
  const fallbackTriggered = Boolean(autonomyState?.fallbackDecision?.triggered);
  const patchReady = String(autonomyState?.patchEngine?.patchStatus || '') === 'draft_ready';
  const planStatus = String(autonomyState?.executionPlan?.planStatus || 'idle');
  const hasHealingIssue = !String(autonomyState?.selfHealing?.lastDetectedIssue || '').toLowerCase().includes('nenhum');

  if (validationScore >= 88) {
    scores.execution_plan += 8;
    scores.patch_generation += 6;
    scores.brain_routing += 4;
  } else {
    scores.execution_plan -= 6;
    scores.patch_generation -= 3;
  }

  if (fallbackTriggered) {
    scores.fallback_strategy += 10;
    scores.brain_routing += 5;
  } else {
    scores.fallback_strategy -= 2;
  }

  if (patchReady) {
    scores.patch_generation += 10;
  } else {
    scores.patch_generation -= 4;
  }

  if (planStatus === 'running' || planStatus === 'completed') {
    scores.execution_plan += 10;
  } else {
    scores.execution_plan -= 5;
  }

  if (hasHealingIssue) {
    scores.self_healing += 12;
  } else {
    scores.self_healing -= 2;
  }

  Object.keys(scores).forEach((key) => {
    scores[key] = clampScore(scores[key]);
  });

  return scores;
}

function pickPriority(scores) {
  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return {
    highestPriorityAction: ordered[0]?.[0] || 'monitorar_missao_ativa',
    downgradedActions: ordered.slice(1).filter(([, score]) => score < ordered[0][1]).map(([name]) => name)
  };
}

export async function recomputeAdaptivePriority() {
  const autonomyState = await getAutonomyState();
  const current = await getAdaptivePriorityState();
  const actionScores = scoreActions(autonomyState, current.actionScores);
  const picked = pickPriority(actionScores);

  const nextState = normalizeState({
    ...current,
    ...picked,
    actionScores,
    priorityReason: `Ação priorizada: ${picked.highestPriorityAction}, baseada em validação ${Number(autonomyState?.validationScore || 0)}, patch ${autonomyState?.patchEngine?.patchStatus || 'idle'} e plano ${autonomyState?.executionPlan?.planStatus || 'idle'}.`,
    recentImpact: [
      {
        createdAt: new Date().toISOString(),
        validationScore: Number(autonomyState?.validationScore || 0),
        highestPriorityAction: picked.highestPriorityAction,
        fallbackTriggered: Boolean(autonomyState?.fallbackDecision?.triggered)
      },
      ...current.recentImpact
    ],
    updatedAt: new Date().toISOString(),
    history: [
      {
        createdAt: new Date().toISOString(),
        actionScores,
        highestPriorityAction: picked.highestPriorityAction
      },
      ...current.history
    ]
  });

  await writeState(nextState);
  return nextState;
}
