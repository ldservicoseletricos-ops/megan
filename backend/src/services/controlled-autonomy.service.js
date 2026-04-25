import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'controlled-autonomy-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  autonomyMode: 'guarded',
  confidenceScore: 72,
  currentCycleFocus: 'Estabilizar o runtime antes da próxima expansão',
  recommendedTrigger: 'Executar memória executiva e detector de gargalos antes de novos módulos',
  nextAutonomousAction: 'Atualizar prioridades operacionais',
  allowedActions: [
    'reordenar prioridades',
    'sugerir próximo passo',
    'disparar análise de gargalos',
    'atualizar foco executivo'
  ],
  blockedActions: [
    'ativar módulos inexistentes',
    'expandir rotas sem validação',
    'reestruturar frontend sem hotfix'
  ],
  guardrails: [
    'somente ações de baixo risco',
    'não quebrar o visual atual',
    'não chamar rotas ausentes'
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

export function getControlledAutonomyState() {
  return readState();
}

export function runControlledAutonomy(payload = {}) {
  const current = readState();
  const nextState = {
    ...current,
    updatedAt: new Date().toISOString(),
    autonomyMode: String(payload.autonomyMode || current.autonomyMode || DEFAULT_STATE.autonomyMode),
    confidenceScore: Number(payload.confidenceScore || current.confidenceScore || DEFAULT_STATE.confidenceScore),
    currentCycleFocus: String(payload.currentCycleFocus || current.currentCycleFocus || DEFAULT_STATE.currentCycleFocus),
    recommendedTrigger: String(payload.recommendedTrigger || 'Executar ciclo controlado com validação de gargalos'),
    nextAutonomousAction: String(payload.nextAutonomousAction || 'Reordenar prioridades do próximo ciclo'),
    allowedActions: normalizeArray(payload.allowedActions, current.allowedActions || DEFAULT_STATE.allowedActions),
    blockedActions: normalizeArray(payload.blockedActions, current.blockedActions || DEFAULT_STATE.blockedActions),
    guardrails: normalizeArray(payload.guardrails, current.guardrails || DEFAULT_STATE.guardrails)
  };

  return writeState(nextState);
}
