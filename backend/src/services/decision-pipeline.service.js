import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'decision-pipeline-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  focus: 'Estabilizar o runtime antes da próxima expansão',
  bottleneck: 'Validação incompleta de rotas',
  autonomousDecision: 'Validar endpoints reais antes de expandir módulos',
  tacticalPlan: [
    'Revisar rotas ativas no backend',
    'Executar análise de gargalos',
    'Escolher a próxima melhoria de baixo risco'
  ],
  decisionSource: 'Controlled Autonomy + Executive Memory + Bottleneck Detector'
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
  }
}

function readState() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeState(state) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

function readJsonIfExists(fileName, fallback = {}) {
  try {
    const full = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(full)) return fallback;
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch {
    return fallback;
  }
}

export function getDecisionPipelineState() {
  return readState();
}

export function runDecisionPipeline() {
  const executive = readJsonIfExists('executive-memory-state.json', {});
  const bottleneck = readJsonIfExists('bottleneck-detector-state.json', {});
  const autonomy = readJsonIfExists('controlled-autonomy-state.json', {});
  const tactical = readJsonIfExists('tactical-executor-state.json', {});

  const focus = executive.currentFocus || 'Estabilizar o runtime antes da próxima expansão';
  const bottleneckTitle = bottleneck.primaryBottleneck || 'Nenhum gargalo priorizado';
  const autonomousDecision = autonomy.nextAutonomousAction || 'Atualizar prioridades operacionais';
  const tacticalPlan = Array.isArray(tactical.threeStepPlan) && tactical.threeStepPlan.length
    ? tactical.threeStepPlan
    : DEFAULT_STATE.tacticalPlan;

  const nextState = {
    ok: true,
    updatedAt: new Date().toISOString(),
    focus,
    bottleneck: bottleneckTitle,
    autonomousDecision,
    tacticalPlan,
    decisionSource: 'Controlled Autonomy + Executive Memory + Bottleneck Detector'
  };

  return writeState(nextState);
}
