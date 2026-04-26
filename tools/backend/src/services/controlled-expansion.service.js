import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getStrategicReviewState, runStrategicReview } from './strategic-review.service.js';
import { getEvolutionGovernanceState } from './evolution-governance.service.js';
import { getEvolutionModeState } from './evolution-mode.service.js';
import { getConsensusEngineState } from './consensus-engine.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'controlled-expansion-state.json');

const DEFAULT_STATE = {
  version: '7.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }); }
function nowIso() { return new Date().toISOString(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
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
      expansionMode: 'controlled',
      expansionReadiness: 'guarded',
      releaseWindow: 'fechada',
      activeLane: 'core_stability',
      safeBudget: 1,
      expansionScore: 0,
      approvedExpansions: [],
      blockedExpansions: [],
      releaseChecklist: [],
      lastExpansionSummary: 'Nenhuma expansão controlada executada ainda.',
      updatedAt: nowIso(),
      createdAt: nowIso(),
      history: []
    };
  }
  return state.users[userId];
}

function buildChecklist({ governanceState, strategicState, consensusState }) {
  return [
    { label: 'Governança sem bloqueio crítico', ok: !(governanceState?.blockers || []).length },
    { label: 'Consenso mínimo para expansão', ok: Number(consensusState?.consensusScore || 0) >= 65 },
    { label: 'Revisão estratégica acima do limiar', ok: Number(strategicState?.reviewScore || 0) >= 55 },
    { label: 'Prontidão diferente de guarded', ok: String(strategicState?.executionReadiness || 'guarded') !== 'guarded' }
  ];
}

export function getControlledExpansionState({ userId='luiz' }={}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runControlledExpansion({ userId='luiz', source='manual' }={}) {
  const refreshedReview = runStrategicReview({ userId, source: 'controlled_expansion' });
  const strategicState = refreshedReview.state || getStrategicReviewState({ userId });
  const governanceState = getEvolutionGovernanceState({ userId });
  const modeState = getEvolutionModeState({ userId });
  const consensusState = getConsensusEngineState({ userId });

  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));
  const checklist = buildChecklist({ governanceState, strategicState, consensusState });
  const passed = checklist.filter((item) => item.ok).length;
  const expansionScore = Math.max(0, Math.min(100, Math.round((Number(strategicState?.reviewScore || 0) * 0.5) + (Number(consensusState?.consensusScore || 0) * 0.3) + (passed * 5) - ((governanceState?.blockers || []).length * 8))));

  const approvedExpansions = [];
  const blockedExpansions = [];

  const lanes = [
    { id: 'core_stability', label: 'Estabilidade do núcleo', required: 0 },
    { id: 'guided_automation', label: 'Automação guiada', required: 55 },
    { id: 'controlled_scaling', label: 'Escala controlada', required: 70 },
    { id: 'aggressive_exploration', label: 'Exploração agressiva', required: 82 }
  ];

  for (const lane of lanes) {
    const allowedByMode = lane.id !== 'aggressive_exploration' || modeState?.selectedMode === 'aggressive';
    const approved = expansionScore >= lane.required && allowedByMode && !(governanceState?.blockers || []).length;
    const item = {
      laneId: lane.id,
      label: lane.label,
      reason: approved
        ? `Liberado com score ${expansionScore} e modo ${modeState?.selectedMode || 'guided_safe'}.`
        : `Bloqueado por score ${expansionScore}, modo ${modeState?.selectedMode || 'guided_safe'} ou bloqueio de governança.`
    };
    if (approved) approvedExpansions.push(item); else blockedExpansions.push(item);
  }

  const activeLane = approvedExpansions[approvedExpansions.length - 1]?.laneId || 'core_stability';
  const releaseWindow = approvedExpansions.length > 1 ? 'aberta com cautela' : approvedExpansions.length ? 'semiaberta' : 'fechada';
  const expansionReadiness = expansionScore >= 78 ? 'ready' : expansionScore >= 60 ? 'controlled' : 'guarded';
  const safeBudget = expansionReadiness === 'ready' ? 3 : expansionReadiness === 'controlled' ? 2 : 1;
  const lastExpansionSummary = `Faixa ativa ${activeLane}. Janela ${releaseWindow}. Score ${expansionScore}. Orçamento seguro ${safeBudget}.`;

  Object.assign(bucket, {
    expansionMode: modeState?.selectedMode === 'aggressive' ? 'accelerated_controlled' : 'controlled',
    expansionReadiness,
    releaseWindow,
    activeLane,
    safeBudget,
    expansionScore,
    approvedExpansions,
    blockedExpansions,
    releaseChecklist: checklist,
    lastExpansionSummary,
    updatedAt: nowIso()
  });

  bucket.history = [{
    id: `controlled-expansion-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    expansionScore,
    activeLane,
    releaseWindow,
    source,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getControlledExpansionState({ userId }),
    inputs: {
      strategicState,
      governanceState,
      modeState,
      consensusState
    }
  };
}
