import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const DATA_FILE = path.join(DATA_DIR, 'auto-delegation-state.json');

const DEFAULT_STATE = {
  ok: true,
  updatedAt: null,
  mode: 'supervision-first',
  delegationScore: 0,
  currentFocus: 'Nenhuma missão delegada',
  eligibleTasks: [],
  delegatedTasks: [],
  blockedTasks: [],
  rules: {
    maxAutoDelegationsPerRun: 2,
    requireStrategicConfidence: 70,
    requireRiskLevelBelow: 'high'
  }
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

function normalizeTask(task, index = 0) {
  if (typeof task === 'string') {
    return {
      id: `task-${Date.now()}-${index}`,
      title: task,
      category: 'general',
      priority: 'medium',
      confidence: 65,
      risk: 'medium'
    };
  }

  return {
    id: task?.id || `task-${Date.now()}-${index}`,
    title: task?.title || 'Tarefa sem título',
    category: task?.category || 'general',
    priority: task?.priority || 'medium',
    confidence: Number(task?.confidence || 65),
    risk: task?.risk || 'medium'
  };
}

function riskWeight(risk) {
  if (risk === 'low') return 25;
  if (risk === 'medium') return 10;
  if (risk === 'high') return -15;
  return -30;
}

function priorityWeight(priority) {
  if (priority === 'critical') return 30;
  if (priority === 'high') return 20;
  if (priority === 'medium') return 10;
  return 5;
}

export function getAutoDelegationState() {
  return readState();
}

export function runAutoDelegation(payload = {}) {
  const current = readState();
  const incomingTasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
  const tasks = incomingTasks.map(normalizeTask);

  const eligibleTasks = [];
  const delegatedTasks = [];
  const blockedTasks = [];

  for (const task of tasks) {
    const score = Math.max(0, Math.min(100, task.confidence + priorityWeight(task.priority) + riskWeight(task.risk)));
    const enriched = { ...task, delegationReadiness: score };

    if (score >= current.rules.requireStrategicConfidence && task.risk !== current.rules.requireRiskLevelBelow) {
      eligibleTasks.push(enriched);
    } else {
      blockedTasks.push({
        ...enriched,
        reason:
          score < current.rules.requireStrategicConfidence
            ? 'Confiança estratégica insuficiente'
            : 'Risco alto exige supervisão'
      });
    }
  }

  delegatedTasks.push(
    ...eligibleTasks.slice(0, current.rules.maxAutoDelegationsPerRun).map((task) => ({
      ...task,
      delegatedAt: new Date().toISOString(),
      status: 'delegated'
    }))
  );

  const nextState = {
    ...current,
    updatedAt: new Date().toISOString(),
    currentFocus: delegatedTasks[0]?.title || blockedTasks[0]?.title || 'Aguardando nova análise',
    delegationScore: delegatedTasks.length
      ? Math.round(delegatedTasks.reduce((sum, item) => sum + item.delegationReadiness, 0) / delegatedTasks.length)
      : 0,
    eligibleTasks,
    delegatedTasks,
    blockedTasks
  };

  return writeState(nextState);
}
