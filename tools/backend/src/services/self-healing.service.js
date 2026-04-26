import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAutonomyState } from './autonomy-core.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const HEALING_FILE = path.join(DATA_DIR, 'self-healing-state.json');

const DEFAULT_HEALING_STATE = {
  enabled: true,
  lastScanAt: null,
  lastPatchSuggestionAt: null,
  lastDetectedIssue: 'Nenhum problema detectado ainda',
  currentRecommendation: 'Aguardando varredura técnica',
  severity: 'low',
  signals: [],
  suggestedFiles: [],
  patchDraft: null,
  history: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function writeHealingState(state) {
  await ensureDataDir();
  await fs.writeFile(HEALING_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function normalizeHealingState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_HEALING_STATE,
    ...base,
    signals: Array.isArray(base.signals) ? base.signals.slice(-20) : [],
    suggestedFiles: Array.isArray(base.suggestedFiles) ? base.suggestedFiles.slice(-12) : [],
    history: Array.isArray(base.history) ? base.history.slice(-30) : []
  };
}

export async function getSelfHealingState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(HEALING_FILE, 'utf-8');
    return normalizeHealingState(JSON.parse(raw));
  } catch {
    const initial = normalizeHealingState(DEFAULT_HEALING_STATE);
    await writeHealingState(initial);
    return initial;
  }
}

function buildSignal(code, severity, message, file) {
  return { code, severity, message, file: file || null, createdAt: new Date().toISOString() };
}

function detectSignals(autonomyState = {}) {
  const signals = [];
  const queueDepth = Number(autonomyState?.priorityQueue?.pendingCount || autonomyState?.queueCount || 0);
  const missionScore = Number(autonomyState?.missionScore ?? autonomyState?.score ?? 0);
  const loopHealth = String(autonomyState?.loopStatus || autonomyState?.runtime?.status || '').toLowerCase();
  const validation = String(autonomyState?.lastValidationResult || '').toLowerCase();
  const lastPatchStatus = String(autonomyState?.patchEngine?.patchStatus || '').toLowerCase();
  const bottleneck = String(autonomyState?.bottleneckNow || '').toLowerCase();

  if (queueDepth >= 8) {
    signals.push(buildSignal('queue_overload', 'high', `Fila operacional alta: ${queueDepth} itens.`, 'backend/src/services/runtime.scheduler.service.js'));
  }

  if (missionScore > 0 && missionScore < 70) {
    signals.push(buildSignal('mission_score_low', 'medium', `Score operacional baixo: ${missionScore}.`, 'backend/src/services/autonomy-core.service.js'));
  }

  if (loopHealth.includes('stalled') || loopHealth.includes('idle') || bottleneck.includes('loop')) {
    signals.push(buildSignal('loop_stalled', 'high', 'Loop autônomo aparenta estar parado ou sem progresso.', 'backend/src/services/runtime.scheduler.service.js'));
  }

  if (validation.includes('error') || validation.includes('fail') || validation.includes('timeout')) {
    signals.push(buildSignal('validation_failure', 'high', 'Última validação registrou falha técnica.', 'backend/src/controllers/autonomy.controller.js'));
  }

  if (lastPatchStatus.includes('rollback') || lastPatchStatus.includes('failed')) {
    signals.push(buildSignal('patch_instability', 'medium', 'O último patch precisou de rollback ou falhou.', 'backend/src/services/patch-engine.service.js'));
  }

  if (bottleneck.includes('backend') || bottleneck.includes('api')) {
    signals.push(buildSignal('backend_bottleneck', 'medium', 'Há gargalo detectado no backend/API.', 'backend/src/controllers/autonomy.controller.js'));
  }

  if (!signals.length) {
    signals.push(buildSignal('healthy_cycle', 'low', 'Nenhum problema crítico detectado no ciclo atual.', 'backend/src/services/autonomy-core.service.js'));
  }

  return signals;
}

function summarizeSignals(signals = []) {
  const sorted = [...signals].sort((a, b) => {
    const rank = { high: 3, medium: 2, low: 1 };
    return (rank[b.severity] || 0) - (rank[a.severity] || 0);
  });
  const top = sorted[0] || null;

  const severity = top?.severity || 'low';
  const issue = top?.message || 'Nenhum problema crítico detectado.';
  const recommendation =
    severity === 'high'
      ? 'Gerar microcorreção supervisionada, validar em dry-run e medir estabilidade antes de promover.'
      : severity === 'medium'
        ? 'Preparar patch pequeno com foco em estabilidade e monitorar o próximo ciclo.'
        : 'Manter monitoramento contínuo e usar evolução incremental supervisionada.';

  const suggestedFiles = [...new Set(sorted.map((item) => item.file).filter(Boolean))].slice(0, 8);

  return {
    severity,
    issue,
    recommendation,
    suggestedFiles,
    patchDraft: {
      type: severity === 'high' ? 'stability_micro_patch' : 'observability_micro_patch',
      objective: recommendation,
      risk: severity === 'high' ? 'médio' : 'baixo',
      sourceSignals: sorted.map((item) => item.code)
    }
  };
}

export async function runSelfHealingScan() {
  const autonomyState = await getAutonomyState();
  const healingState = await getSelfHealingState();
  const signals = detectSignals(autonomyState);
  const summary = summarizeSignals(signals);

  const nextState = normalizeHealingState({
    ...healingState,
    lastScanAt: new Date().toISOString(),
    lastPatchSuggestionAt: new Date().toISOString(),
    lastDetectedIssue: summary.issue,
    currentRecommendation: summary.recommendation,
    severity: summary.severity,
    signals,
    suggestedFiles: summary.suggestedFiles,
    patchDraft: summary.patchDraft,
    history: [
      {
        createdAt: new Date().toISOString(),
        severity: summary.severity,
        issue: summary.issue,
        recommendation: summary.recommendation,
        signals,
        files: summary.suggestedFiles
      },
      ...(Array.isArray(healingState.history) ? healingState.history : [])
    ]
  });

  await writeHealingState(nextState);
  return nextState;
}

export async function setSelfHealingEnabled(enabled = true) {
  const current = await getSelfHealingState();
  const nextState = normalizeHealingState({
    ...current,
    enabled: Boolean(enabled)
  });
  await writeHealingState(nextState);
  return nextState;
}
