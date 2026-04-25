import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'action-now-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  title: 'Validar rotas reais do backend',
  reason: 'Maior gargalo atual identificado',
  expectedImpact: 'Desbloqueia expansão segura',
  predictedRisk: 'baixo',
  decidedBy: 'Controlled Autonomy',
  sourceFocus: 'Estabilizar o runtime antes da próxima expansão'
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

export function getActionNowState() {
  return readState();
}

export function runActionNow() {
  const executive = readJsonIfExists('executive-memory-state.json', {});
  const bottleneck = readJsonIfExists('bottleneck-detector-state.json', {});
  const autonomy = readJsonIfExists('controlled-autonomy-state.json', {});
  const tactical = readJsonIfExists('tactical-executor-state.json', {});

  const title = autonomy.nextAutonomousAction || tactical.actionNow || 'Validar base atual antes de expandir';
  const reason = bottleneck.primaryBottleneck
    ? `Gargalo principal: ${bottleneck.primaryBottleneck}`
    : 'Maior gargalo atual identificado';
  const expectedImpact = tactical.expectedImpact || 'alto';
  const predictedRisk = tactical.predictedRisk || bottleneck.overallRisk || 'baixo';
  const decidedBy = 'Controlled Autonomy';
  const sourceFocus = executive.currentFocus || 'Estabilizar o runtime antes da próxima expansão';

  const nextState = {
    ok: true,
    updatedAt: new Date().toISOString(),
    title,
    reason,
    expectedImpact,
    predictedRisk,
    decidedBy,
    sourceFocus
  };

  return writeState(nextState);
}
