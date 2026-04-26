import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runFounderMode, getFounderModeState } from './founder-ai-mode.service.js';
import { runRevenueEngine, getRevenueEngineState } from './revenue-engine.service.js';
import { runSelfExpansionCycle, getSelfExpansionState } from './self-expansion-engine.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'runtime-scheduler-state.json');

let timer = null;
let inFlight = false;

function now() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    isRunning: false,
    intervalMs: 15000,
    runCount: 0,
    lastRunAt: null,
    lastMission: null,
    lastSummary: null
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

export function getRuntimeSchedulerState() {
  return readState();
}

export function runSchedulerCycle({ mission = 'expandir com segurança' } = {}) {
  if (inFlight) {
    return { ok: true, skipped: true, reason: 'cycle_already_running', state: readState() };
  }

  inFlight = true;
  try {
    const founder = runFounderMode({ mission, approveGrowth: /escala|expandir|crescer/i.test(mission) });
    const revenue = runRevenueEngine({ mission });
    const schedulerState = readState();
    const expansion = runSelfExpansionCycle({
      mission,
      founderState: founder.state,
      revenueState: revenue.state,
      schedulerState
    });

    const nextState = {
      ...schedulerState,
      runCount: schedulerState.runCount + 1,
      lastRunAt: now(),
      lastMission: mission,
      lastSummary: {
        founderStage: founder.stage,
        revenueScore: revenue.revenueScore,
        expansionStage: expansion.stage,
        bestOpportunity: expansion.bestOpportunity?.title ?? null
      }
    };

    saveState(nextState);

    return {
      ok: true,
      founder,
      revenue,
      expansion,
      state: nextState
    };
  } finally {
    inFlight = false;
  }
}

export function startRuntimeScheduler({ intervalMs = 15000, mission = 'expandir com segurança' } = {}) {
  const state = readState();
  if (timer) clearInterval(timer);

  const nextState = {
    ...state,
    isRunning: true,
    intervalMs: Number(intervalMs) || 15000,
    lastMission: mission
  };
  saveState(nextState);

  timer = setInterval(() => {
    runSchedulerCycle({ mission });
  }, nextState.intervalMs);

  return nextState;
}

export function stopRuntimeScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  const state = readState();
  const nextState = {
    ...state,
    isRunning: false
  };
  saveState(nextState);
  return nextState;
}

export function getRuntimeCompositeState() {
  return {
    scheduler: getRuntimeSchedulerState(),
    founder: getFounderModeState(),
    revenue: getRevenueEngineState(),
    expansion: getSelfExpansionState()
  };
}
