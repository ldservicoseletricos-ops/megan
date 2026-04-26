import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';
import { getDecisionMemoryState } from './decision-memory.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FALLBACK_FILE = path.join(DATA_DIR, 'fallback-history-state.json');

const DEFAULT_STATE = {
  enabled: true,
  lastFallbackAt: null,
  fallbackTriggered: false,
  fallbackReason: 'Nenhum fallback acionado ainda',
  previousStrategy: 'Nenhuma',
  nextStrategy: 'Nenhuma',
  confidence: 0,
  history: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_STATE,
    ...base,
    history: Array.isArray(base.history) ? base.history.slice(-20) : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getFallbackHistoryState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(FALLBACK_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function chooseAlternativeStrategy(currentBrain = 'operational', unstablePatterns = []) {
  const blocked = new Set((unstablePatterns || []).map((item) => String(item?.brain || '').toLowerCase()));
  const options = ['technical', 'strategic', 'operational', 'editorial'].filter((brain) => brain !== currentBrain);
  const safe = options.find((brain) => !blocked.has(brain));
  return safe || options[0] || 'operational';
}

export async function evaluateAndTriggerFallback() {
  const current = await getFallbackHistoryState();
  const autonomyState = await getAutonomyState();
  const decisionMemory = await getDecisionMemoryState();

  const validationScore = Number(autonomyState?.validationScore || 0);
  const unstablePatterns = Array.isArray(decisionMemory?.unstablePatterns) ? decisionMemory.unstablePatterns : [];
  const currentBrain = String(autonomyState?.activeBrain || 'operational');
  const badRecentPattern = unstablePatterns.length > 0 && String(unstablePatterns[0]?.brain || '') === currentBrain;

  const shouldFallback = validationScore < 86 || badRecentPattern;
  const nextStrategy = shouldFallback ? chooseAlternativeStrategy(currentBrain, unstablePatterns) : currentBrain;

  const reason = shouldFallback
    ? `Fallback acionado por score ${validationScore} e/ou repetição de padrão instável.`
    : 'Nenhum fallback necessário. Estratégia atual mantida.';

  const nextState = normalizeState({
    ...current,
    lastFallbackAt: new Date().toISOString(),
    fallbackTriggered: shouldFallback,
    fallbackReason: reason,
    previousStrategy: currentBrain,
    nextStrategy,
    confidence: shouldFallback ? 91 : 78,
    history: [
      {
        createdAt: new Date().toISOString(),
        fallbackTriggered: shouldFallback,
        fallbackReason: reason,
        previousStrategy: currentBrain,
        nextStrategy,
        validationScore
      },
      ...current.history
    ]
  });

  await writeState(nextState);
  return nextState;
}
