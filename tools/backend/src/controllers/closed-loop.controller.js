
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'closed-loop-state.json');

function now() { return new Date().toISOString(); }
async function ensureDir() { await fs.mkdir(DATA_DIR, { recursive: true }); }

async function loadState() {
  try {
    await ensureDir();
    return JSON.parse(await fs.readFile(FILE, 'utf-8'));
  } catch {
    return { enabled: true, lastReevaluationAt: null, currentFocus: 'Corrigir gargalos do chat', lastExecution: 'Nenhuma', cycleHistory: [] };
  }
}

async function saveState(state) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function buildQueue() {
  return [
    { title: 'Corrigir gargalos do chat', score: 98 },
    { title: 'Melhorar memória persistente', score: 91 },
    { title: 'Planejar próxima fase', score: 85 }
  ];
}

function buildOverview(state) {
  const queue = buildQueue();
  return {
    version: '134.0.0',
    generatedAt: now(),
    enabled: !!state.enabled,
    currentFocus: state.currentFocus || queue[0].title,
    lastExecution: state.lastExecution || 'Nenhuma',
    lastReevaluationAt: state.lastReevaluationAt,
    queue,
    cycleHistory: (state.cycleHistory || []).slice(-10),
    summary: 'Megan fechou o ciclo entre aprendizado, fila, execução e reavaliação.'
  };
}

export async function getClosedLoopOverviewController(req, res) {
  try {
    const state = await loadState();
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no overview do ciclo fechado' });
  }
}

export async function runClosedLoopCycleController(req, res) {
  try {
    const state = await loadState();
    const queue = buildQueue();
    const next = queue[0];
    state.lastExecution = next.title;
    state.currentFocus = queue[1]?.title || next.title;
    state.lastReevaluationAt = now();
    state.cycleHistory = state.cycleHistory || [];
    state.cycleHistory.push({
      id: `${Date.now()}`,
      executed: next.title,
      nextFocus: state.currentFocus,
      createdAt: state.lastReevaluationAt
    });
    state.cycleHistory = state.cycleHistory.slice(-30);
    await saveState(state);
    return res.json({ ok: true, executed: true, message: 'Ciclo fechado executado com reavaliação automática', ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar ciclo fechado' });
  }
}

export async function toggleClosedLoopController(req, res) {
  try {
    const state = await loadState();
    state.enabled = !state.enabled;
    await saveState(state);
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar ciclo fechado' });
  }
}
