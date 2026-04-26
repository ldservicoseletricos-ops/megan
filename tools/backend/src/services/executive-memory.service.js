import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'executive-memory-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  mission: 'Estabilizar e evoluir a Megan OS',
  currentFocus: 'Consolidar runtime do backend',
  executiveSummary: 'Nenhum ciclo executivo registrado ainda.',
  criticalTasks: [
    'Validar rotas reais do backend',
    'Manter visual premium estável',
    'Adicionar evolução sem reintroduzir 404'
  ],
  persistentPriorities: [
    'Estabilidade do runtime',
    'Continuidade da missão',
    'Evolução controlada'
  ],
  contextNotes: [
    'Base atual trabalha com Auto Delegation e Strategic Forecast.',
    'Novos módulos devem entrar sem quebrar o frontend.'
  ],
  lastDecision: 'Priorizar estabilidade antes da próxima expansão'
};

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
  }
}

function readState() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
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

export function getExecutiveMemoryState() {
  return readState();
}

export function runExecutiveMemory(payload = {}) {
  const current = readState();

  const nextState = {
    ...current,
    updatedAt: new Date().toISOString(),
    mission: String(payload.mission || current.mission || DEFAULT_STATE.mission),
    currentFocus: String(payload.currentFocus || current.currentFocus || DEFAULT_STATE.currentFocus),
    executiveSummary: String(
      payload.executiveSummary ||
      `Foco executivo atualizado em ${new Date().toLocaleString('pt-BR')}.`
    ),
    criticalTasks: normalizeArray(payload.criticalTasks, current.criticalTasks || DEFAULT_STATE.criticalTasks),
    persistentPriorities: normalizeArray(payload.persistentPriorities, current.persistentPriorities || DEFAULT_STATE.persistentPriorities),
    contextNotes: normalizeArray(payload.contextNotes, current.contextNotes || DEFAULT_STATE.contextNotes),
    lastDecision: String(payload.lastDecision || current.lastDecision || DEFAULT_STATE.lastDecision)
  };

  return writeState(nextState);
}
