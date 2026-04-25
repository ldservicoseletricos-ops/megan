import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';
import { getDecisionMemoryState } from './decision-memory.service.js';
import { listPriorityQueue, getNextPriorityQueueItem } from './priority-queue.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'self-learning-fusion-state.json');

const DEFAULT_STATE = {
  learningStatus: 'idle',
  recentLearnings: [],
  appliedImprovements: [],
  adjustedWeights: [],
  evolutionScore: 0,
  rollbacks: [],
  lessonsLearned: [],
  nextLearningOpportunity: 'Aguardando sinais de execução',
  updatedAt: null,
  history: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeItem(item = {}) {
  return {
    name: String(item.name || ''),
    value: Number(item.value || 0),
    detail: String(item.detail || '')
  };
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_STATE,
    ...base,
    recentLearnings: Array.isArray(base.recentLearnings) ? base.recentLearnings.slice(-20) : [],
    appliedImprovements: Array.isArray(base.appliedImprovements) ? base.appliedImprovements.slice(-20) : [],
    adjustedWeights: Array.isArray(base.adjustedWeights) ? base.adjustedWeights.map(normalizeItem).slice(-20) : [],
    rollbacks: Array.isArray(base.rollbacks) ? base.rollbacks.slice(-20) : [],
    lessonsLearned: Array.isArray(base.lessonsLearned) ? base.lessonsLearned.slice(-30) : [],
    history: Array.isArray(base.history) ? base.history.slice(-40) : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getFusionLearningState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function buildLearningView({ autonomyState = {}, decisionMemory = {}, queue = {}, nextItem = null } = {}) {
  const stablePatterns = Array.isArray(decisionMemory?.stablePatterns) ? decisionMemory.stablePatterns.length : 0;
  const unstablePatterns = Array.isArray(decisionMemory?.unstablePatterns) ? decisionMemory.unstablePatterns.length : 0;
  const queueItems = Array.isArray(queue?.items) ? queue.items : [];
  const validationScore = Number(autonomyState?.validationScore || 0);
  const riskLevel = String(autonomyState?.riskLevel || 'baixo').toLowerCase();

  const recentLearnings = [
    stablePatterns
      ? `Há ${stablePatterns} padrões estáveis reaproveitáveis na memória de decisão.`
      : 'Ainda não há padrões estáveis consolidados.',
    queueItems.length
      ? `A fila tem ${queueItems.length} ações observáveis para priorização.`
      : 'Ainda não existe fila de execução consolidada.',
    validationScore
      ? `A validação atual do núcleo está em score ${validationScore}.`
      : 'A validação ainda precisa de mais ciclos para ficar confiável.'
  ];

  const appliedImprovements = [];
  if (nextItem?.title) appliedImprovements.push(`Próxima ação destacada: ${nextItem.title}`);
  if (stablePatterns) appliedImprovements.push('Reforço de padrões estáveis para decisões futuras');
  if (queueItems.length) appliedImprovements.push('Fila de execução pronta para orientar o próximo passo');

  const adjustedWeights = [
    { name: 'memory_weight', value: Math.min(100, 60 + stablePatterns * 4), detail: 'mais padrões estáveis aumentam o peso da memória' },
    { name: 'execution_weight', value: Math.min(100, 55 + queueItems.length * 3), detail: 'mais ações observáveis reforçam a execução' },
    { name: 'risk_weight', value: riskLevel.includes('alto') ? 82 : riskLevel.includes('médio') ? 68 : 54, detail: 'peso de risco conforme o estado atual' }
  ];

  const rollbacks = [];
  if (riskLevel.includes('alto')) rollbacks.push('Risco alto detectado: segurar expansão e manter foco em estabilidade.');
  if (unstablePatterns > stablePatterns && unstablePatterns > 2) {
    rollbacks.push('Padrões instáveis predominam: reduzir agressividade do próximo ciclo.');
  }

  const lessonsLearned = [
    stablePatterns ? 'Padrões estáveis devem orientar novos ciclos antes de abrir escopo.' : 'Sem padrão estável, a Megan deve operar em modo conservador.',
    nextItem?.title ? `A próxima ação mais clara agora é: ${nextItem.title}.` : 'Sem próxima ação clara, o sistema deve priorizar coleta de contexto.',
    unstablePatterns ? `Existem ${unstablePatterns} sinais de instabilidade pedindo revisão.` : 'Não há sinais fortes de regressão armazenados no momento.'
  ];

  let evolutionScore = 58;
  evolutionScore += Math.min(20, stablePatterns * 3);
  evolutionScore += Math.min(12, queueItems.length * 2);
  evolutionScore += Math.round(validationScore * 0.12);
  evolutionScore -= Math.min(18, unstablePatterns * 2);
  if (riskLevel.includes('alto')) evolutionScore -= 10;
  evolutionScore = Math.max(0, Math.min(100, evolutionScore));

  const nextLearningOpportunity = nextItem?.title
    ? `Executar e avaliar: ${nextItem.title}`
    : 'Registrar mais memória útil e empilhar uma próxima ação clara.';

  return {
    recentLearnings,
    appliedImprovements,
    adjustedWeights,
    evolutionScore,
    rollbacks,
    lessonsLearned,
    nextLearningOpportunity
  };
}

export async function runFusionLearningCycle({ userId = 'anonymous' } = {}) {
  const current = await getFusionLearningState();
  const autonomyState = await getAutonomyState();
  const decisionMemory = await getDecisionMemoryState();
  const queue = listPriorityQueue({ userId });
  const { nextItem } = getNextPriorityQueueItem({ userId });
  const view = buildLearningView({ autonomyState, decisionMemory, queue, nextItem });

  const nextState = normalizeState({
    ...current,
    learningStatus: 'running',
    ...view,
    updatedAt: new Date().toISOString(),
    history: [
      {
        createdAt: new Date().toISOString(),
        evolutionScore: view.evolutionScore,
        queueSize: queue.total || 0,
        stablePatterns: Array.isArray(decisionMemory?.stablePatterns) ? decisionMemory.stablePatterns.length : 0,
        unstablePatterns: Array.isArray(decisionMemory?.unstablePatterns) ? decisionMemory.unstablePatterns.length : 0
      },
      ...current.history
    ]
  });

  await writeState(nextState);
  return nextState;
}
