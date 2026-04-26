import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'bottleneck-detector-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  overallRisk: 'moderado',
  primaryBottleneck: 'Nenhum gargalo priorizado',
  bottlenecks: [
    {
      id: 'runtime-stability',
      title: 'Validação incompleta de rotas',
      impact: 'alto',
      urgency: 'alta',
      unblockRecommendation: 'Validar cada nova rota antes de expandir o frontend'
    },
    {
      id: 'module-sprawl',
      title: 'Expansão excessiva de módulos',
      impact: 'médio',
      urgency: 'média',
      unblockRecommendation: 'Adicionar módulos novos somente sobre base estável'
    }
  ]
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

function normalizeItem(item, index) {
  if (typeof item === 'string') {
    return {
      id: `bottleneck-${index + 1}`,
      title: item,
      impact: 'médio',
      urgency: 'média',
      unblockRecommendation: 'Revisar este ponto e definir uma ação concreta'
    };
  }

  return {
    id: item?.id || `bottleneck-${index + 1}`,
    title: String(item?.title || 'Gargalo sem título'),
    impact: String(item?.impact || 'médio'),
    urgency: String(item?.urgency || 'média'),
    unblockRecommendation: String(item?.unblockRecommendation || 'Sem recomendação registrada')
  };
}

function riskFromBottlenecks(items) {
  const hasHigh = items.some((item) => String(item.impact).toLowerCase() === 'alto' || String(item.urgency).toLowerCase() === 'alta');
  if (hasHigh) return 'alto';
  if (items.length) return 'moderado';
  return 'baixo';
}

export function getBottleneckDetectorState() {
  return readState();
}

export function runBottleneckDetector(payload = {}) {
  const current = readState();
  const source = Array.isArray(payload?.bottlenecks) ? payload.bottlenecks : current.bottlenecks;
  const bottlenecks = source.map(normalizeItem);

  const nextState = {
    ok: true,
    updatedAt: new Date().toISOString(),
    overallRisk: riskFromBottlenecks(bottlenecks),
    primaryBottleneck: bottlenecks[0]?.title || 'Nenhum gargalo priorizado',
    bottlenecks
  };

  return writeState(nextState);
}
