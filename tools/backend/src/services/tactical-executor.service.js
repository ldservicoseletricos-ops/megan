import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'tactical-executor-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  actionNow: 'Validar base atual antes de expandir',
  estimatedTime: '15-30 min',
  predictedRisk: 'baixo',
  expectedImpact: 'alto',
  threeStepPlan: [
    'Atualizar estado executivo',
    'Executar detector de gargalos',
    'Escolher a próxima melhoria de baixo risco'
  ],
  executionNotes: [
    'Evitar mudanças estruturais sem hotfix',
    'Priorizar o que mantém o runtime limpo'
  ]
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

function normalizeArray(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  return value.filter(Boolean).map((item) => String(item));
}

export function getTacticalExecutorState() {
  return readState();
}

export function runTacticalExecutor(payload = {}) {
  const current = readState();

  const nextState = {
    ...current,
    updatedAt: new Date().toISOString(),
    actionNow: String(payload.actionNow || current.actionNow || DEFAULT_STATE.actionNow),
    estimatedTime: String(payload.estimatedTime || current.estimatedTime || DEFAULT_STATE.estimatedTime),
    predictedRisk: String(payload.predictedRisk || current.predictedRisk || DEFAULT_STATE.predictedRisk),
    expectedImpact: String(payload.expectedImpact || current.expectedImpact || DEFAULT_STATE.expectedImpact),
    threeStepPlan: normalizeArray(payload.threeStepPlan, current.threeStepPlan || DEFAULT_STATE.threeStepPlan),
    executionNotes: normalizeArray(payload.executionNotes, current.executionNotes || DEFAULT_STATE.executionNotes)
  };

  return writeState(nextState);
}
