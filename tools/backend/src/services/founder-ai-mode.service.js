import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'founder-ai-mode-state.json');

function now() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    enabled: false,
    stage: 'build',
    founderScore: 61,
    confidence: 64,
    stabilityScore: 58,
    lastRunAt: null,
    decisions: []
  };
}

function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return defaultState();
    return { ...defaultState(), ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  return state;
}

export function getFounderModeState() {
  return readState();
}

export function setFounderModeEnabled(enabled) {
  const state = readState();
  state.enabled = Boolean(enabled);
  state.lastRunAt = now();
  return saveState(state);
}

export function runFounderMode({ mission = '', approveGrowth = false } = {}) {
  const state = readState();
  const missionWeight = /crescer|receita|empresa|mercado|escala/i.test(mission) ? 8 : 0;
  const stage = approveGrowth ? 'scale' : state.stage === 'build' ? 'validate' : state.stage;
  const founderScore = Math.min(100, state.founderScore + 2 + missionWeight);
  const confidence = Math.min(100, state.confidence + (approveGrowth ? 4 : 1));
  const stabilityScore = Math.min(100, state.stabilityScore + 1);
  const nextDecision = stage === 'scale'
    ? 'priorizar aquisição, monetização e expansão controlada'
    : stage === 'validate'
      ? 'validar proposta de valor e preparar oferta pagável'
      : 'fortalecer base técnica e narrativa comercial';

  const nextState = {
    ...state,
    stage,
    founderScore,
    confidence,
    stabilityScore,
    lastRunAt: now(),
    decisions: [
      {
        at: now(),
        mission,
        approveGrowth: Boolean(approveGrowth),
        stage,
        nextDecision
      },
      ...state.decisions
    ].slice(0, 30)
  };

  saveState(nextState);
  return {
    ok: true,
    stage,
    founderScore,
    confidence,
    stabilityScore,
    nextDecision,
    state: nextState
  };
}
