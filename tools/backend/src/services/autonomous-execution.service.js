const { readJson, writeJson } = require('./store.service');
const stateService = require('./state.service');
const memory = require('./memory.service');
const cycleHistory = require('./cycle-history.service');

const FILE = 'autonomous-execution.json';
const MAX_LEARNING_ITEMS = 60;

function nowIso() {
  return new Date().toISOString();
}

function baseModel() {
  return {
    updatedAt: nowIso(),
    mode: 'assisted-autonomy',
    priorityFocus: 'repo_stability',
    confidence: 71,
    learningCount: 0,
    lastAction: 'monitoring',
    queue: [
      {
        id: 'autonomy_repo_validate',
        title: 'Validar repositório e reduzir falhas de base',
        type: 'repo_validation',
        priority: 96,
        command: 'validar repo',
        reason: 'A base precisa permanecer íntegra antes de aplicar novas melhorias.',
        status: 'queued',
      },
      {
        id: 'autonomy_run_cycle',
        title: 'Executar ciclo real de melhoria',
        type: 'real_cycle',
        priority: 93,
        command: 'executar ciclo',
        reason: 'Aplicar melhorias seguras aprovadas e atualizar readiness.',
        status: 'queued',
      },
      {
        id: 'autonomy_env_audit',
        title: 'Auditar ambiente e recuperar configuração mínima',
        type: 'env_audit',
        priority: 88,
        command: 'env status',
        reason: 'Ambiente consistente reduz regressões e acelera deploy.',
        status: 'queued',
      }
    ],
    learning: [],
  };
}

function getModel() {
  return readJson(FILE, baseModel());
}

function saveModel(model) {
  model.updatedAt = nowIso();
  writeJson(FILE, model);
  return model;
}

function normalizeQueue(queue = []) {
  return queue
    .map((item, index) => ({
      id: item.id || `autonomy_${index}_${Date.now()}`,
      title: item.title || 'Ação autônoma',
      type: item.type || 'generic',
      priority: Number(item.priority || 50),
      command: item.command || 'status',
      reason: item.reason || 'Sem motivo informado.',
      status: item.status || 'queued',
      updatedAt: item.updatedAt || nowIso(),
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 12);
}

function buildPlan() {
  const state = stateService.getState();
  const timeline = cycleHistory.getHistory().slice(0, 8);
  const model = getModel();
  const queue = [];

  queue.push({
    id: 'repo_guard',
    title: 'Blindar raiz do repositório',
    type: 'repo_validation',
    priority: state.repoConnected ? 82 : 99,
    command: 'validar repo',
    reason: state.repoConnected ? 'Manter score do repositório em nível alto.' : 'Sem repositório confiável não existe autonomia segura.',
    status: 'queued',
  });

  queue.push({
    id: 'cycle_real',
    title: 'Executar ciclo real aprovado',
    type: 'real_cycle',
    priority: state.readiness >= 90 ? 92 : 86,
    command: 'executar ciclo',
    reason: `Readiness atual em ${state.readiness}%. O próximo ganho vem de um ciclo real com patches seguros.`,
    status: 'queued',
  });

  queue.push({
    id: 'env_guard',
    title: 'Auditar ambiente operacional',
    type: 'env_audit',
    priority: state.buildReadiness < 85 ? 91 : 78,
    command: 'env status',
    reason: `Build readiness em ${state.buildReadiness}%. Vale garantir .env, portas e dependências.`,
    status: 'queued',
  });

  if (timeline.some((item) => !item.buildOk)) {
    queue.push({
      id: 'self_heal',
      title: 'Ativar recuperação de falhas recentes',
      type: 'self_heal',
      priority: 97,
      command: 'reparar sistema',
      reason: 'Há ciclos recentes com build falhando. Autonomia precisa reduzir atrito antes de escalar.',
      status: 'queued',
    });
  }

  const normalized = normalizeQueue(queue);
  const next = {
    ...model,
    mode: state.readiness >= 92 ? 'active-autonomy' : 'assisted-autonomy',
    priorityFocus: normalized[0]?.type || 'monitoring',
    confidence: Math.max(55, Math.min(99, Math.round((state.readiness * 0.55) + (state.successRate * 0.25) + (state.buildReadiness * 0.20) / 1))),
    lastAction: 'plan_refreshed',
    queue: normalized,
  };

  memory.addMemory(
    'autonomy_plan',
    'autonomous_execution_service',
    `Plano autônomo atualizado com foco em ${next.priorityFocus} e ${normalized.length} ação(ões) priorizadas.`,
    'medium'
  );

  return saveModel(next);
}

function learnFromLatestCycle() {
  const model = getModel();
  const latestCycle = cycleHistory.getHistory()[0];
  const state = stateService.getState();
  const insight = latestCycle
    ? {
        id: `learn_${Date.now()}`,
        createdAt: nowIso(),
        source: 'cycle_history',
        lesson: latestCycle.buildOk
          ? `Ciclos com build ok e ${latestCycle.approvedPatches} patches aprovados mantêm a autonomia estável.`
          : 'Quando o build falha, a prioridade deve migrar para reparação e validação.',
        action: latestCycle.buildOk ? 'continuar_ciclo_real' : 'priorizar_self_heal',
        confidenceDelta: latestCycle.buildOk ? 3 : -4,
      }
    : {
        id: `learn_${Date.now()}`,
        createdAt: nowIso(),
        source: 'state_snapshot',
        lesson: `Sem histórico recente, a autonomia usa readiness ${state.readiness}% como base para agir com cautela.`,
        action: 'monitorar_e_planejar',
        confidenceDelta: 1,
      };

  const next = {
    ...model,
    learningCount: Number(model.learningCount || 0) + 1,
    confidence: Math.max(40, Math.min(99, Number(model.confidence || 70) + insight.confidenceDelta)),
    lastAction: 'learning_updated',
    learning: [insight, ...(model.learning || [])].slice(0, MAX_LEARNING_ITEMS),
  };

  memory.addMemory(
    'autonomy_learning',
    'autonomous_execution_service',
    `${insight.lesson} Ação sugerida: ${insight.action}.`,
    'medium'
  );

  return saveModel(next);
}

function getAutonomyStatus() {
  const state = stateService.getState();
  const model = getModel();
  return {
    mode: model.mode,
    priorityFocus: model.priorityFocus,
    confidence: model.confidence,
    learningCount: model.learningCount,
    lastAction: model.lastAction,
    queue: normalizeQueue(model.queue),
    learning: (model.learning || []).slice(0, 8),
    autonomyScore: Math.max(0, Math.min(100, Math.round((state.readiness * 0.45) + (state.successRate * 0.20) + (state.buildReadiness * 0.15) + (state.deployReadiness * 0.10) + (Number(model.confidence || 70) * 0.10)))),
    updatedAt: model.updatedAt,
  };
}

function getNextAction() {
  const model = getModel();
  const queue = normalizeQueue(model.queue);
  return queue[0] || null;
}

function markActionExecuted(actionId, resultSummary) {
  const model = getModel();
  const queue = normalizeQueue(model.queue).map((item) => item.id === actionId
    ? { ...item, status: 'done', updatedAt: nowIso(), resultSummary: resultSummary || 'Executado.' }
    : item);
  const next = {
    ...model,
    lastAction: actionId || 'executed',
    queue,
  };
  return saveModel(next);
}

module.exports = {
  getAutonomyStatus,
  buildPlan,
  learnFromLatestCycle,
  getNextAction,
  markActionExecuted,
};
