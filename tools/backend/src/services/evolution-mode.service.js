import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { evaluateEvolutionGovernance, getEvolutionGovernanceState } from './evolution-governance.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'evolution-mode-state.json');

const DEFAULT_STATE = {
  version: '6.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function nowIso() { return new Date().toISOString(); }
function safeRead() {
  try {
    if (!fs.existsSync(STATE_PATH)) return structuredClone(DEFAULT_STATE);
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}
function safeWrite(state) {
  ensureDir();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      selectedMode: 'guided_safe',
      modeLabel: 'Seguro guiado',
      rationale: 'Protege a evolução enquanto consolida o núcleo cognitivo.',
      changeCount: 0,
      updatedAt: nowIso(),
      createdAt: nowIso(),
      history: []
    };
  }
  return state.users[userId];
}

const MODE_MAP = {
  guided_safe: {
    modeLabel: 'Seguro guiado',
    rationale: 'Aplica somente melhorias seguras e preserva validação prévia.'
  },
  supervised: {
    modeLabel: 'Supervisionado',
    rationale: 'Permite ajustes, mas exige revisão para mudanças mais sensíveis.'
  },
  aggressive: {
    modeLabel: 'Agressivo controlado',
    rationale: 'Acelera a evolução quando consenso e feedback estão favoráveis.'
  }
};

export function getEvolutionModeState({ userId='luiz' }={}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function setEvolutionMode({ userId='luiz', mode='guided_safe' }={}) {
  const normalizedMode = MODE_MAP[mode] ? mode : 'guided_safe';
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const meta = MODE_MAP[normalizedMode];

  bucket.selectedMode = normalizedMode;
  bucket.modeLabel = meta.modeLabel;
  bucket.rationale = meta.rationale;
  bucket.changeCount = Number(bucket.changeCount || 0) + 1;
  bucket.updatedAt = nowIso();
  bucket.history = [{ mode: normalizedMode, changedAt: nowIso() }, ...(bucket.history || [])].slice(0, 20);
  state.updatedAt = nowIso();
  safeWrite(state);

  const governance = evaluateEvolutionGovernance({ userId, mode: normalizedMode });

  return {
    ok: true,
    state: getEvolutionModeState({ userId }),
    governance: governance.state,
    governanceSummary: getEvolutionGovernanceState({ userId }).policySummary
  };
}
