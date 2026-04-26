import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const MEMORY_FILE = path.join(DATA_DIR, 'decision-memory-state.json');

const DEFAULT_MEMORY_STATE = {
  lastStableBrain: 'operational',
  lastStablePatchType: 'none',
  lastStablePlanTitle: 'Nenhum plano consolidado',
  lastStableHealingIssue: 'Nenhum healing consolidado',
  lastStableValidation: 'Nenhuma validação consolidada',
  stablePatterns: [],
  unstablePatterns: [],
  decisionSummary: 'Nenhuma memória consolidada ainda',
  updatedAt: null,
  history: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_MEMORY_STATE,
    ...base,
    stablePatterns: Array.isArray(base.stablePatterns) ? base.stablePatterns.slice(-20) : [],
    unstablePatterns: Array.isArray(base.unstablePatterns) ? base.unstablePatterns.slice(-20) : [],
    history: Array.isArray(base.history) ? base.history.slice(-20) : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(MEMORY_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getDecisionMemoryState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(MEMORY_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_MEMORY_STATE);
    await writeState(initial);
    return initial;
  }
}

function buildSummary(autonomyState = {}) {
  return [
    `Brain estável: ${autonomyState?.activeBrain || 'operational'}.`,
    `Patch: ${autonomyState?.patchEngine?.lastPatchType || 'none'}.`,
    `Plano: ${autonomyState?.executionPlan?.planTitle || 'Nenhum plano ativo'}.`,
    `Healing: ${autonomyState?.selfHealing?.lastDetectedIssue || 'Nenhum problema detectado'}.`,
    `Validação: ${autonomyState?.lastValidationResult || 'Nenhuma validação executada ainda'}.`
  ].join(' ');
}

export async function syncDecisionMemoryFromAutonomy() {
  const autonomyState = await getAutonomyState();
  const current = await getDecisionMemoryState();

  const validationText = String(autonomyState?.lastValidationResult || '').toLowerCase();
  const isStable = validationText.includes('aprovada') || (validationText.includes('score') && Number(autonomyState?.validationScore || 0) >= 84);

  const pattern = {
    createdAt: new Date().toISOString(),
    brain: autonomyState?.activeBrain || 'operational',
    patch: autonomyState?.patchEngine?.lastPatchType || 'none',
    plan: autonomyState?.executionPlan?.planTitle || 'Nenhum plano ativo',
    healing: autonomyState?.selfHealing?.lastDetectedIssue || 'Nenhum problema detectado',
    validation: autonomyState?.lastValidationResult || 'Nenhuma validação executada ainda'
  };

  const nextState = normalizeState({
    ...current,
    lastStableBrain: isStable ? (autonomyState?.activeBrain || current.lastStableBrain) : current.lastStableBrain,
    lastStablePatchType: isStable ? (autonomyState?.patchEngine?.lastPatchType || current.lastStablePatchType) : current.lastStablePatchType,
    lastStablePlanTitle: isStable ? (autonomyState?.executionPlan?.planTitle || current.lastStablePlanTitle) : current.lastStablePlanTitle,
    lastStableHealingIssue: isStable ? (autonomyState?.selfHealing?.lastDetectedIssue || current.lastStableHealingIssue) : current.lastStableHealingIssue,
    lastStableValidation: isStable ? (autonomyState?.lastValidationResult || current.lastStableValidation) : current.lastStableValidation,
    decisionSummary: buildSummary(autonomyState),
    updatedAt: new Date().toISOString(),
    stablePatterns: isStable ? [pattern, ...current.stablePatterns] : current.stablePatterns,
    unstablePatterns: isStable ? current.unstablePatterns : [pattern, ...current.unstablePatterns],
    history: [pattern, ...current.history]
  });

  await writeState(nextState);
  return nextState;
}
