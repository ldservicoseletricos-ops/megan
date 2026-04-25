import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'auto-cycle-state.json');

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
      enabled: true,
      intervalSeconds: 30,
      lastRunAt: null,
      currentAction: 'Aguardando ciclo',
      queue: [
        { id: '1', title: 'Revisar gargalos do chat', status: 'queued' },
        { id: '2', title: 'Melhorar memória persistente', status: 'queued' },
        { id: '3', title: 'Planejar próxima fase', status: 'queued' }
      ]
    };
  }
}

async function saveState(state) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function computeQueue(queue = []) {
  const next = queue.find((item) => item.status === 'queued') || queue[0] || null;
  return { next };
}

function buildOverview(state) {
  const { next } = computeQueue(state.queue);
  return {
    version: '126.0.0',
    enabled: !!state.enabled,
    intervalSeconds: state.intervalSeconds || 30,
    lastRunAt: state.lastRunAt || null,
    currentAction: state.currentAction || 'Aguardando ciclo',
    nextAction: next?.title || 'Sem próxima ação',
    queue: state.queue || []
  };
}

export async function getAutoCycleOverviewController(req, res) {
  try {
    const state = await loadState();
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no overview do ciclo automático' });
  }
}

export async function runAutoCycleNowController(req, res) {
  try {
    const state = await loadState();
    const next = state.queue.find((item) => item.status === 'queued');

    if (next) {
      next.status = 'done';
      state.currentAction = next.title;
    } else {
      state.currentAction = 'Sem ações pendentes';
    }

    state.lastRunAt = now();
    await saveState(state);

    return res.json({
      ok: true,
      executed: true,
      message: 'Ciclo automático executado agora',
      ...buildOverview(state)
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar ciclo automático' });
  }
}

export async function toggleAutoCycleController(req, res) {
  try {
    const state = await loadState();
    state.enabled = !state.enabled;
    await saveState(state);
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar ciclo automático' });
  }
}
