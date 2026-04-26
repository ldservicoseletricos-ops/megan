import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'cycle-learning-state.json');

function now() {
  return new Date().toISOString();
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function loadState() {
  try {
    await ensureDir();
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      history: [],
      learnedPriority: 'Corrigir gargalos do chat',
      recommendedQueue: [
        'Corrigir gargalos do chat',
        'Melhorar memória persistente',
        'Planejar próxima fase'
      ]
    };
  }
}

async function saveState(state) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function buildOverview(state) {
  return {
    version: '126.0.0',
    generatedAt: now(),
    learnedPriority: state.learnedPriority,
    recommendedQueue: state.recommendedQueue,
    totalCycles: state.history.length,
    recentTrend: state.history.length >= 3 ? 'estável com aprendizado' : 'aprendendo'
  };
}

export async function getCycleLearningOverviewController(req, res) {
  try {
    const state = await loadState();
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Falha no overview de aprendizado'
    });
  }
}

export async function runCycleLearningRecordController(req, res) {
  try {
    const body = req.body || {};
    const state = await loadState();

    const item = {
      id: `${Date.now()}`,
      action: body.action || 'Ciclo executado',
      createdAt: now()
    };

    state.history.push(item);

    if (state.history.length > 20) {
      state.history = state.history.slice(-20);
    }

    const actionCount = {};
    for (const entry of state.history) {
      actionCount[entry.action] = (actionCount[entry.action] || 0) + 1;
    }

    const sorted = Object.entries(actionCount).sort((a, b) => b[1] - a[1]);
    state.learnedPriority = sorted[0]?.[0] || state.learnedPriority;
    state.recommendedQueue = sorted.map(([name]) => name);

    await saveState(state);

    return res.json({
      ok: true,
      message: 'Aprendizado registrado',
      ...buildOverview(state)
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Falha ao registrar aprendizado'
    });
  }
}
