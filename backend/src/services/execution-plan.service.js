import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const PLAN_FILE = path.join(DATA_DIR, 'execution-plan-state.json');

const DEFAULT_STATE = {
  activePlanId: null,
  planTitle: 'Nenhum plano ativo',
  planStatus: 'idle',
  currentStepIndex: -1,
  steps: [],
  lastExecutionSummary: 'Nenhuma execução registrada ainda',
  updatedAt: null,
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
    steps: Array.isArray(base.steps) ? base.steps.slice(-20) : [],
    history: Array.isArray(base.history) ? base.history.slice(-20) : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(PLAN_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getExecutionPlanState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(PLAN_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function makePlanId() {
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildPlanFromAutonomy(autonomyState = {}) {
  const brain = String(autonomyState?.activeBrain || 'operational');
  const mission = String(autonomyState?.activeMission || 'Executar missão da Megan OS');
  const recommendation = String(
    autonomyState?.suggestedImprovement ||
    autonomyState?.nextStep ||
    'Validar fluxo principal'
  );

  const baseSteps = [
    { id: 'step_1', title: 'Analisar estado atual', status: 'pending', objective: 'Revisar missão, brain ativo e gargalos do momento' },
    { id: 'step_2', title: 'Aplicar melhoria sugerida', status: 'pending', objective: recommendation },
    { id: 'step_3', title: 'Validar resultado', status: 'pending', objective: 'Confirmar se a execução melhorou o estado central' }
  ];

  baseSteps.push({
    id: 'step_4',
    title: 'Fechar execução',
    status: 'pending',
    objective: `Encerrar ciclo do brain ${brain}`
  });

  return {
    activePlanId: makePlanId(),
    planTitle: mission,
    planStatus: 'running',
    currentStepIndex: 0,
    steps: baseSteps
  };
}

export async function createExecutionPlanFromAutonomy() {
  const autonomyState = await getAutonomyState();
  const current = await getExecutionPlanState();
  const plan = buildPlanFromAutonomy(autonomyState);

  const nextState = normalizeState({
    ...current,
    ...plan,
    updatedAt: new Date().toISOString(),
    lastExecutionSummary: `Plano criado com ${plan.steps.length} etapas.`
  });

  await writeState(nextState);
  return nextState;
}

export async function advanceExecutionPlan() {
  const current = await getExecutionPlanState();

  if (!Array.isArray(current.steps) || !current.steps.length) {
    return current;
  }

  const steps = current.steps.map((step) => ({ ...step }));
  let currentIndex = Number(current.currentStepIndex ?? -1);

  if (currentIndex >= 0 && currentIndex < steps.length) {
    steps[currentIndex].status = 'done';
  }

  const nextIndex = currentIndex + 1;

  if (nextIndex < steps.length) {
    steps[nextIndex].status = 'running';
    currentIndex = nextIndex;
  } else {
    currentIndex = steps.length - 1;
  }

  const isFinished = steps.every((step) => step.status === 'done');

  const nextState = normalizeState({
    ...current,
    steps,
    currentStepIndex: currentIndex,
    planStatus: isFinished ? 'completed' : 'running',
    updatedAt: new Date().toISOString(),
    lastExecutionSummary: isFinished ? 'Plano concluído com sucesso.' : `Etapa atual: ${steps[currentIndex]?.title || '—'}`
  });

  await writeState(nextState);
  return nextState;
}
