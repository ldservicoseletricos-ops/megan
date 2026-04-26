import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'revenue-engine-state.json');

function now() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    enabled: false,
    revenueScore: 57,
    opportunityScore: 59,
    lastRunAt: null,
    ideas: [],
    history: []
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

export function getRevenueEngineState() {
  return readState();
}

export function setRevenueEngineEnabled(enabled) {
  const state = readState();
  state.enabled = Boolean(enabled);
  return saveState(state);
}

export function runRevenueEngine({ mission = '' } = {}) {
  const state = readState();
  const ideas = [
    {
      id: 'starter-plan',
      title: 'Plano Starter mensal',
      score: 74,
      nextAction: 'Criar oferta simples e página de conversão'
    },
    {
      id: 'enterprise-pilot',
      title: 'Piloto enterprise supervisionado',
      score: 69,
      nextAction: 'Definir escopo premium e proposta de valor'
    },
    {
      id: 'automation-pack',
      title: 'Pacote de automação para PMEs',
      score: 72,
      nextAction: 'Empacotar recursos operacionais em oferta pronta'
    }
  ].sort((a, b) => b.score - a.score);

  const missionBoost = /receita|venda|plano|cliente|empresa/i.test(mission) ? 6 : 0;
  const nextState = {
    ...state,
    revenueScore: Math.min(100, 58 + missionBoost + ideas[0].score / 4),
    opportunityScore: ideas[0].score,
    lastRunAt: now(),
    ideas,
    history: [
      {
        at: now(),
        mission,
        bestIdeaId: ideas[0].id,
        opportunityScore: ideas[0].score
      },
      ...state.history
    ].slice(0, 40)
  };

  saveState(nextState);
  return {
    ok: true,
    revenueScore: nextState.revenueScore,
    opportunityScore: nextState.opportunityScore,
    bestIdea: ideas[0],
    ideas,
    state: nextState
  };
}
