
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'intelligent-execution-state.json');

function now() { return new Date().toISOString(); }
async function ensureDir() { await fs.mkdir(DATA_DIR, { recursive: true }); }

async function loadState() {
  try {
    await ensureDir();
    return JSON.parse(await fs.readFile(FILE, 'utf-8'));
  } catch {
    return { enabled: true, lastExecutedAt: null, lastExecutedAction: 'Nenhuma', executionHistory: [] };
  }
}

async function saveState(state) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function buildQueue() {
  return [
    { id: '1', title: 'Corrigir gargalos do chat', reason: 'prioridade aprendida dominante', score: 98 },
    { id: '2', title: 'Melhorar memória persistente', reason: 'impacto alto e recorrente', score: 91 },
    { id: '3', title: 'Planejar próxima fase', reason: 'continuidade operacional', score: 85 }
  ];
}

function buildOverview(state) {
  const queue = buildQueue();
  const next = queue[0];
  return {
    version: '134.0.0',
    generatedAt: now(),
    enabled: !!state.enabled,
    nextAction: next?.title || 'Sem próxima ação',
    nextReason: next?.reason || 'Sem motivo',
    lastExecutedAt: state.lastExecutedAt,
    lastExecutedAction: state.lastExecutedAction,
    executionHistory: (state.executionHistory || []).slice(-10),
    queue
  };
}

export async function getIntelligentExecutionOverviewController(req, res) {
  try {
    const state = await loadState();
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no overview da execução inteligente' });
  }
}

export async function runIntelligentExecutionNowController(req, res) {
  try {
    const state = await loadState();
    const next = buildQueue()[0];
    state.lastExecutedAt = now();
    state.lastExecutedAction = next.title;
    state.executionHistory = state.executionHistory || [];
    state.executionHistory.push({
      id: `${Date.now()}`,
      action: next.title,
      reason: next.reason,
      score: next.score,
      createdAt: state.lastExecutedAt
    });
    state.executionHistory = state.executionHistory.slice(-30);
    await saveState(state);
    return res.json({ ok: true, executed: true, message: `Ação executada automaticamente: ${next.title}`, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar ação inteligente' });
  }
}

export async function toggleIntelligentExecutionController(req, res) {
  try {
    const state = await loadState();
    state.enabled = !state.enabled;
    await saveState(state);
    return res.json({ ok: true, ...buildOverview(state) });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao alternar execução inteligente' });
  }
}
