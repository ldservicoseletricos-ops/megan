import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const FILE = path.join(DATA_DIR, 'central-orchestrator-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  leaderModule: 'Controlled Autonomy',
  nextModule: 'Tactical Executor',
  standbyModules: ['Strategic Forecast', 'Auto Delegation'],
  activeModules: ['Executive Memory', 'Bottleneck Detector', 'Controlled Autonomy'],
  reason: 'Maior necessidade atual é decidir e agir com baixo risco.'
};

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf8');
}
function readJson(name, fallback={}) {
  try {
    const f = path.join(DATA_DIR, name);
    if (!fs.existsSync(f)) return fallback;
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch { return fallback; }
}
function read() { ensure(); try { return JSON.parse(fs.readFileSync(FILE,'utf8')); } catch { return {...DEFAULT_STATE}; } }
function write(v){ ensure(); fs.writeFileSync(FILE, JSON.stringify(v,null,2),'utf8'); return v; }

export function getCentralOrchestratorState(){ return read(); }

export function runCentralOrchestrator(){
  const bottleneck = readJson('bottleneck-detector-state.json', {});
  const tactical = readJson('tactical-executor-state.json', {});
  const risk = String(bottleneck.overallRisk || tactical.predictedRisk || 'baixo').toLowerCase();

  let leaderModule = 'Controlled Autonomy';
  let nextModule = 'Tactical Executor';
  let reason = 'Maior necessidade atual é decidir e agir com baixo risco.';
  if (risk === 'alto') {
    leaderModule = 'Bottleneck Detector';
    nextModule = 'Controlled Autonomy';
    reason = 'Risco alto exige remover gargalo principal antes de executar.';
  } else if (risk === 'moderado') {
    leaderModule = 'Executive Memory';
    nextModule = 'Controlled Autonomy';
    reason = 'Risco moderado exige alinhar foco antes de decidir.';
  }

  return write({
    ok:true,
    updatedAt:new Date().toISOString(),
    leaderModule,
    nextModule,
    standbyModules:['Strategic Forecast','Auto Delegation'],
    activeModules:['Executive Memory','Bottleneck Detector','Controlled Autonomy'],
    reason
  });
}
