import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'self-expansion-engine-state.json');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function now() {
  return new Date().toISOString();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function defaultState() {
  return {
    enabled: false,
    lastRunAt: null,
    lastDecisionAt: null,
    stage: 'discover',
    expansionScore: 54,
    confidence: 61,
    riskScore: 34,
    targetDomains: ['saas', 'automacao', 'enterprise'],
    activeSignals: {
      backlogPressure: 42,
      monetizationReadiness: 58,
      founderAlignment: 63,
      technicalStability: 55,
      marketWindow: 60
    },
    pipeline: [],
    history: []
  };
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

export function getSelfExpansionState() {
  const state = { ...defaultState(), ...readJson(STATE_FILE, {}) };
  if (!Array.isArray(state.pipeline)) state.pipeline = [];
  if (!Array.isArray(state.history)) state.history = [];
  if (!state.activeSignals || typeof state.activeSignals !== 'object') {
    state.activeSignals = defaultState().activeSignals;
  }
  return state;
}

export function saveSelfExpansionState(nextState) {
  writeJson(STATE_FILE, nextState);
  return nextState;
}

export function setSelfExpansionEnabled(enabled) {
  const state = getSelfExpansionState();
  state.enabled = Boolean(enabled);
  state.lastDecisionAt = now();
  saveSelfExpansionState(state);
  return state;
}

function buildOpportunities({ mission = '', founderStage = 'build', revenueState = {}, schedulerState = {} } = {}) {
  const monetizationReadiness = Number(revenueState?.opportunityScore ?? revenueState?.revenueScore ?? 58);
  const schedulerLoad = Number(schedulerState?.runCount ?? 0);
  const founderBoost = founderStage === 'scale' ? 9 : founderStage === 'launch' ? 6 : founderStage === 'validate' ? 3 : 0;
  const missionBoost = /empresa|receita|venda|escala|mercado|cliente/i.test(mission) ? 8 : 0;

  return [
    {
      id: 'expansion-saas-starter',
      title: 'Empacotar Megan Starter SaaS',
      domain: 'saas',
      effort: 'medium',
      risk: 31,
      value: 78 + founderBoost + Math.floor(monetizationReadiness / 8),
      confidence: 69 + missionBoost,
      nextAction: 'Definir landing page, onboarding e plano inicial',
      why: 'Alta aderência ao estágio atual com potencial de assinatura recorrente.'
    },
    {
      id: 'expansion-enterprise-pilot',
      title: 'Abrir piloto enterprise supervisionado',
      domain: 'enterprise',
      effort: 'high',
      risk: 48,
      value: 73 + founderBoost,
      confidence: 62 + Math.floor(monetizationReadiness / 12),
      nextAction: 'Preparar proposta premium, prova de valor e escopo controlado',
      why: 'Bom caminho para contratos maiores sem depender de escala pública imediata.'
    },
    {
      id: 'expansion-automation-pack',
      title: 'Lançar pacote de automação operacional',
      domain: 'automacao',
      effort: 'medium',
      risk: 26,
      value: 71 + Math.floor((60 - Math.min(60, schedulerLoad)) / 6),
      confidence: 74,
      nextAction: 'Criar oferta de automação pronta para PMEs',
      why: 'Aproveita a base operacional já construída e reduz tempo até receita.'
    },
    {
      id: 'expansion-marketplace',
      title: 'Criar catálogo de módulos vendáveis',
      domain: 'marketplace',
      effort: 'medium',
      risk: 39,
      value: 67,
      confidence: 59,
      nextAction: 'Separar módulos maduros e transformar em ofertas independentes',
      why: 'Expande a monetização sem depender de um único produto principal.'
    }
  ].map((item) => {
    const score = clamp(Math.round(item.value * 0.45 + item.confidence * 0.35 + (100 - item.risk) * 0.20), 1, 100);
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);
}

function detectStage(bestOpportunity) {
  if (!bestOpportunity) return 'discover';
  if (bestOpportunity.score >= 82) return 'expand';
  if (bestOpportunity.score >= 72) return 'validate';
  if (bestOpportunity.score >= 60) return 'discover';
  return 'stabilize';
}

export function runSelfExpansionCycle({ mission = '', founderState = {}, revenueState = {}, schedulerState = {} } = {}) {
  const state = getSelfExpansionState();
  const opportunities = buildOpportunities({
    mission,
    founderStage: founderState?.stage,
    revenueState,
    schedulerState
  });

  const bestOpportunity = opportunities[0] ?? null;
  const stage = detectStage(bestOpportunity);
  const expansionScore = bestOpportunity ? bestOpportunity.score : 50;
  const confidence = bestOpportunity ? bestOpportunity.confidence : 50;
  const riskScore = bestOpportunity ? bestOpportunity.risk : 50;

  const nextState = {
    ...state,
    stage,
    lastRunAt: now(),
    lastDecisionAt: now(),
    expansionScore,
    confidence,
    riskScore,
    activeSignals: {
      backlogPressure: Number(schedulerState?.isRunning ? 55 : 35),
      monetizationReadiness: Number(revenueState?.opportunityScore ?? revenueState?.revenueScore ?? 58),
      founderAlignment: Number(founderState?.confidence ?? founderState?.founderScore ?? 63),
      technicalStability: Number(founderState?.stabilityScore ?? 55),
      marketWindow: bestOpportunity ? clamp(bestOpportunity.value, 1, 100) : 60
    },
    pipeline: opportunities,
    history: [
      {
        at: now(),
        mission,
        stage,
        bestOpportunityId: bestOpportunity?.id ?? null,
        score: expansionScore,
        confidence,
        riskScore
      },
      ...state.history
    ].slice(0, 40)
  };

  saveSelfExpansionState(nextState);

  return {
    ok: true,
    stage,
    bestOpportunity,
    expansionScore,
    confidence,
    riskScore,
    pipeline: nextState.pipeline,
    state: nextState
  };
}
