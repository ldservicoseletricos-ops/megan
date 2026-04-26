const { readJson, writeJson } = require('./store.service');
const stateService = require('./state.service');
const autonomous = require('./autonomous-execution.service');
const cycleHistory = require('./cycle-history.service');

const FILE = 'multi-brain-orchestrator-state.json';

function nowIso() {
  return new Date().toISOString();
}

function baseModel() {
  return {
    updatedAt: nowIso(),
    round: 0,
    mode: 'cooperative',
    brains: [],
    lastPlan: [],
    executionLog: [],
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

function buildBrains() {
  const state = stateService.getState();
  const autonomy = autonomous.getAutonomyStatus();
  const lastCycle = cycleHistory.getHistory()[0] || {};

  return [
    {
      id: 'strategic_brain',
      name: 'Strategic Brain',
      focus: 'priorities',
      priority: state.readiness < 92 ? 96 : 82,
      task: state.readiness < 92 ? 'Replanejar prioridades e elevar readiness.' : 'Preparar expansão segura da autonomia.',
      command: 'planejar autonomia',
      reason: `Readiness atual ${state.readiness || 0}% exige direção clara para a próxima rodada.`,
    },
    {
      id: 'healing_brain',
      name: 'Healing Brain',
      focus: 'self_healing',
      priority: lastCycle.buildOk === false ? 99 : 78,
      task: lastCycle.buildOk === false ? 'Ativar recuperação de falhas e estabilizar build.' : 'Monitorar sinais de regressão e prevenir falhas.',
      command: lastCycle.buildOk === false ? 'reparar sistema' : 'diagnostico completo',
      reason: lastCycle.buildOk === false ? 'Último ciclo teve falha de build.' : 'Sem falhas críticas recentes, atuação preventiva.',
    },
    {
      id: 'operational_brain',
      name: 'Operational Brain',
      focus: 'execution',
      priority: autonomy.queue?.length ? Number(autonomy.queue[0].priority || 85) : 85,
      task: autonomy.queue?.length ? autonomy.queue[0].title : 'Executar próxima ação operacional segura.',
      command: autonomy.queue?.length ? autonomy.queue[0].command : 'executar proxima acao',
      reason: autonomy.queue?.length ? autonomy.queue[0].reason : 'Fila autônoma precisa avançar continuamente.',
    },
    {
      id: 'deployment_brain',
      name: 'Deployment Brain',
      focus: 'release_readiness',
      priority: state.deployReadiness >= 90 ? 84 : 72,
      task: state.deployReadiness >= 90 ? 'Preparar janela de deploy e validar push.' : 'Aguardar maturidade maior antes de liberar deploy.',
      command: state.deployReadiness >= 90 ? 'preparar deploy' : 'git status',
      reason: `Deploy readiness em ${state.deployReadiness || 0}%.`,
    },
  ].sort((a,b) => b.priority - a.priority);
}

function planRound() {
  const model = getModel();
  const brains = buildBrains();
  const round = Number(model.round || 0) + 1;
  const lastPlan = brains.map((brain, index) => ({
    round,
    slot: index + 1,
    brainId: brain.id,
    name: brain.name,
    focus: brain.focus,
    priority: brain.priority,
    command: brain.command,
    task: brain.task,
    reason: brain.reason,
    plannedAt: nowIso(),
    status: 'planned',
  }));

  return saveModel({
    ...model,
    round,
    brains,
    lastPlan,
  });
}

function executeRound() {
  const planned = planRound();
  const autonomy = autonomous.getAutonomyStatus();
  const executionLog = [...(planned.executionLog || [])];

  for (const item of planned.lastPlan.slice(0, 3)) {
    let result = 'monitorado';
    if (item.command === 'planejar autonomia') {
      autonomous.buildPlan();
      result = 'plano_autonomo_atualizado';
    } else if (item.command === 'executar proxima acao' || item.command === 'executar ciclo') {
      const next = autonomous.getNextAction();
      if (next) {
        autonomous.markActionExecuted(next.id, 'executado_por_multi_brain');
        result = `acao_executada:${next.command}`;
      } else {
        result = 'fila_vazia';
      }
    } else if (item.command === 'aprender agora') {
      autonomous.learnFromLatestCycle();
      result = 'aprendizado_reforcado';
    } else if (item.command === 'preparar deploy') {
      result = 'preflight_sugerido';
    } else if (item.command === 'diagnostico completo' || item.command === 'reparar sistema') {
      result = 'healing_priorizado';
    }

    executionLog.unshift({
      id: `${item.brainId}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      round: planned.round,
      brainId: item.brainId,
      name: item.name,
      command: item.command,
      result,
      executedAt: nowIso(),
    });
  }

  return saveModel({
    ...planned,
    executionLog: executionLog.slice(0, 40),
  });
}

function getStatus() {
  const model = getModel();
  const autonomy = autonomous.getAutonomyStatus();
  const brains = model.brains?.length ? model.brains : buildBrains();
  return {
    mode: model.mode || 'cooperative',
    round: Number(model.round || 0),
    brains,
    lastPlan: model.lastPlan || [],
    executionLog: (model.executionLog || []).slice(0, 12),
    nextSharedObjective: brains[0]?.task || 'Monitorar sistema.',
    cooperativeScore: Math.max(0, Math.min(100, Math.round(((autonomy.autonomyScore || 0) * 0.6) + ((brains[0]?.priority || 0) * 0.4)))),
    updatedAt: model.updatedAt || nowIso(),
  };
}

module.exports = {
  getStatus,
  planRound,
  executeRound,
};
