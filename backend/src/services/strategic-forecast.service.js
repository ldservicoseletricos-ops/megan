import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'strategic-forecast-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  horizon: '30d',
  confidence: 0,
  primaryForecast: 'Nenhuma previsão gerada',
  opportunities: [],
  risks: [],
  recommendedMoves: [],
  trendSignals: []
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

function normalizeArray(value, fallback = []) {
  return Array.isArray(value) ? value.filter(Boolean).map((item) => String(item)) : fallback;
}

export function getStrategicForecastState() {
  return readState();
}

export function runStrategicForecast(payload = {}) {
  const opportunities = normalizeArray(payload?.opportunities, [
    'Consolidar os módulos já integrados antes de expandir',
    'Transformar os cérebros ativos em workflows reutilizáveis'
  ]);
  const risks = normalizeArray(payload?.risks, [
    'Acoplamento excessivo entre frontend e backend',
    'Crescimento de módulos sem validação real de runtime'
  ]);
  const trendSignals = normalizeArray(payload?.trendSignals, [
    'Mais valor em estabilidade do que em quantidade de pacotes',
    'Priorizar memória executiva e missões persistentes'
  ]);

  const confidence = Math.max(40, Math.min(95, 55 + opportunities.length * 6 - risks.length * 3 + trendSignals.length * 4));

  const recommendedMoves = [
    'Reduzir complexidade antes da próxima expansão',
    'Executar hotfixes de runtime antes de novos módulos',
    'Priorizar missões com maior impacto e menor risco'
  ];

  const nextState = {
    ok: true,
    updatedAt: new Date().toISOString(),
    horizon: String(payload?.horizon || '30d'),
    confidence,
    primaryForecast:
      confidence >= 75
        ? 'A Megan pode expandir com segurança controlada se mantiver validação contínua.'
        : 'A Megan deve focar em estabilização antes de ampliar a autonomia.',
    opportunities,
    risks,
    recommendedMoves,
    trendSignals
  };

  return writeState(nextState);
}
