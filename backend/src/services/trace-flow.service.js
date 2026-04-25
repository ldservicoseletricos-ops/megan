import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'trace-flow-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  focus: 'Estabilizar o runtime',
  bottleneck: 'Validação incompleta de rotas',
  decision: 'Validar endpoints reais',
  plan: 'Checklist técnico em 3 passos'
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

export function getTraceFlowState() {
  return readState();
}

export function runTraceFlow() {
  const executive = readJsonIfExists('executive-memory-state.json', {});
  const bottleneck = readJsonIfExists('bottleneck-detector-state.json', {});
  const autonomy = readJsonIfExists('controlled-autonomy-state.json', {});
  const tactical = readJsonIfExists('tactical-executor-state.json', {});

  const nextState = {
    ok: true,
    updatedAt: new Date().toISOString(),
    focus: executive.currentFocus || 'Estabilizar o runtime',
    bottleneck: bottleneck.primaryBottleneck || 'Nenhum gargalo priorizado',
    decision: autonomy.nextAutonomousAction || 'Atualizar prioridades operacionais',
    plan: tactical.actionNow || 'Checklist técnico em 3 passos'
  };

  return writeState(nextState);
}
