import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const MEMORY_FILE = path.join(DATA_DIR, 'advanced-memory-state.json');

const DEFAULT_MEMORY_STATE = {
  activeObjective: 'Operar a Megan OS com continuidade e memória persistente',
  activeContext: 'Aguardando nova missão do Luiz',
  recentDecisions: [],
  recentAttempts: [],
  avoidList: [],
  successPatterns: [],
  missionSummary: 'Nenhum resumo consolidado ainda',
  updatedAt: null
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_MEMORY_STATE,
    ...base,
    recentDecisions: Array.isArray(base.recentDecisions) ? base.recentDecisions.slice(-12) : [],
    recentAttempts: Array.isArray(base.recentAttempts) ? base.recentAttempts.slice(-12) : [],
    avoidList: Array.isArray(base.avoidList) ? base.avoidList.slice(-20) : [],
    successPatterns: Array.isArray(base.successPatterns) ? base.successPatterns.slice(-20) : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(MEMORY_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getAdvancedMemoryState() {
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

function summarizeMission(autonomyState) {
  const activeMission = String(autonomyState?.activeMission || '').trim() || 'Sem missão definida';
  const bottleneck = String(autonomyState?.bottleneckNow || autonomyState?.currentProblem || '').trim() || 'Nenhum gargalo relevante';
  const improvement = String(autonomyState?.suggestedImprovement || autonomyState?.nextStep || '').trim() || 'Aguardar nova mensagem';
  return `Missão: ${activeMission}. Gargalo: ${bottleneck}. Próximo foco: ${improvement}.`;
}

export async function syncAdvancedMemoryFromAutonomy(autonomyState = {}) {
  const current = await getAdvancedMemoryState();

  const activeObjective =
    String(autonomyState?.activeMission || '').trim() ||
    current.activeObjective;

  const activeContext =
    String(autonomyState?.lastUserMessage || '').trim() ||
    String(autonomyState?.currentProblem || '').trim() ||
    current.activeContext;

  const decision = {
    createdAt: new Date().toISOString(),
    decision: String(autonomyState?.suggestedImprovement || autonomyState?.nextStep || 'Sem decisão registrada'),
    validation: String(autonomyState?.lastValidationResult || 'Sem validação')
  };

  const attempt = {
    createdAt: new Date().toISOString(),
    attempt: String(autonomyState?.lastLoopSummary || 'Sem tentativa registrada'),
    score: Number(autonomyState?.validationScore || 0)
  };

  const missionSummary = summarizeMission(autonomyState);

  const nextState = normalizeState({
    ...current,
    activeObjective,
    activeContext,
    missionSummary,
    updatedAt: new Date().toISOString(),
    recentDecisions: [...current.recentDecisions, decision],
    recentAttempts: [...current.recentAttempts, attempt]
  });

  if (String(autonomyState?.lastValidationResult || '').toLowerCase().includes('parcial')) {
    nextState.avoidList = [...nextState.avoidList, 'Repetir fluxo parcialmente validado sem ajuste'];
  }

  if (String(autonomyState?.lastValidationResult || '').toLowerCase().includes('aprovada')) {
    nextState.successPatterns = [...nextState.successPatterns, String(autonomyState?.suggestedImprovement || autonomyState?.nextStep || 'Fluxo validado')];
  }

  nextState.avoidList = Array.from(new Set(nextState.avoidList)).slice(-20);
  nextState.successPatterns = Array.from(new Set(nextState.successPatterns)).slice(-20);

  await writeState(nextState);
  return nextState;
}
