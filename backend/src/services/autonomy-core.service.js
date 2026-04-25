import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { runSelfHealingScan } from './self-healing.service.js';
import { routeMissionToBrain } from './multi-brains.service.js';
import { generateSupervisedPatch } from './patch-engine.service.js';
import { createExecutionPlanFromAutonomy, advanceExecutionPlan } from './execution-plan.service.js';
import { syncDecisionMemoryFromAutonomy, getDecisionMemoryState } from './decision-memory.service.js';
import { evaluateAndTriggerFallback } from './fallback-history.service.js';
import { recomputeAdaptivePriority } from './adaptive-priority.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'autonomy-core-state.json');

const DEFAULT_STATE = {
  project: 'Megan OS',
  category: 'Autonomia',
  status: 'Pronta',
  activeMission: 'Operar como núcleo central da Megan OS',
  currentProblem: 'Nenhum',
  nextStep: 'Aguardar nova mensagem do Luiz',
  lastUserMessage: '',
  lastReply: '',
  runtimeMode: 'Adaptive Priority Loop Integration',
  activeBrain: 'operational',
  brainConfidence: 0,
  brainReason: 'Nenhum roteamento executado ainda',
  memoryDrivenDecision: {
    usedStablePattern: 'Nenhum padrão usado ainda',
    avoidedPattern: 'Nenhum padrão evitado ainda',
    decisionReason: 'Nenhuma decisão orientada por memória ainda'
  },
  fallbackDecision: {
    triggered: false,
    reason: 'Nenhum fallback integrado ainda',
    previousStrategy: 'Nenhuma',
    nextStrategy: 'Nenhuma',
    confidence: 0
  },
  adaptivePriority: {
    highestPriorityAction: 'monitorar_missao_ativa',
    downgradedActions: [],
    priorityReason: 'Nenhuma prioridade adaptativa integrada ainda',
    actionScores: {}
  },
  systemHealth: 'stable',
  priorityNow: 'monitorar_missao_ativa',
  currentExecution: 'idle',
  lastLoopSummary: 'Núcleo aguardando missão',
  bottleneckNow: 'Nenhum gargalo relevante detectado',
  suggestedImprovement: 'Aguardar nova missão para analisar melhorias',
  riskLevel: 'baixo',
  evolutionProgress: 0,
  validationScore: 0,
  autoLoopEnabled: false,
  lastValidationResult: 'Nenhuma validação executada ainda',
  selfHealing: {
    enabled: true,
    lastDetectedIssue: 'Nenhum problema detectado ainda',
    currentRecommendation: 'Aguardando varredura técnica',
    suggestedFiles: [],
    patchDraft: null,
    lastScanAt: null
  },
  patchEngine: {
    lastPatchType: 'none',
    patchObjective: 'Nenhum patch gerado ainda',
    patchRisk: 'baixo',
    patchStatus: 'idle',
    targetFiles: [],
    patchDraft: null,
    lastGeneratedAt: null
  },
  executionPlan: {
    activePlanId: null,
    planTitle: 'Nenhum plano ativo',
    planStatus: 'idle',
    currentStepIndex: -1,
    steps: [],
    lastExecutionSummary: 'Nenhuma execução registrada ainda'
  },
  autonomyStrategist: {
    strategistScore: 0,
    goalClarity: 0,
    initiativeReadiness: 0,
    strategicFocus: 'stabilize-and-learn',
    primaryObjective: 'Consolidar memória técnica e preparar metas supervisionadas.',
    expansionVector: 'Incremental supervision',
    strategistDirective: 'Aguardar sinais validados antes de ampliar o escopo.',
    nextStrategicMove: 'Revisar aprendizado recente e definir um objetivo curto.',
    lastStrategistAt: null
  },
  metaGoalEngine: {
    metaGoalScore: 0,
    goalPortfolioHealth: 0,
    autonomyAim: 'stability-first',
    goalTimeHorizon: 'curto prazo',
    primaryMetaGoal: 'Reduzir risco e consolidar aprendizado validado.',
    secondaryMetaGoal: 'Preparar novos ciclos de evolução supervisionada.',
    goalDirective: 'Manter metas pequenas, reversíveis e orientadas por validação.',
    nextGoalReview: 'Aguardar novo ciclo do estrategista antes de revisar metas.',
    lastMetaGoalAt: null
  },
  goalDecomposer: {
    decomposerScore: 0,
    goalBreakdownReadiness: 0,
    subgoalCount: 0,
    executionComplexity: 0,
    primarySubgoal: 'Aguardar meta principal estável antes de decompor.',
    secondarySubgoal: 'Nenhuma submeta derivada ainda.',
    nextSubgoal: 'Revisar portfólio e preparar uma etapa curta.',
    resourceNeed: 'baixo',
    timePressure: 'controlada',
    dependencyLoad: 0,
    criticalBlocker: 'Nenhum bloqueio crítico detectado.',
    decomposerDirective: 'Só decompor metas quando houver clareza, validação e baixo risco.',
    lastDecomposerAt: null
  },
  executionRoadmap: {
    roadmapScore: 0,
    planReadiness: 0,
    milestoneCount: 0,
    executionWindow: 'aguardando decomposição estável',
    currentMilestone: 'Nenhum marco ativo ainda.',
    nextMilestone: 'Aguardar submetas claras antes de abrir roadmap.',
    criticalPath: 'Nenhum caminho crítico definido.',
    resourceAllocation: 'conservadora',
    roadmapDirective: 'Só abrir roadmap quando a meta estiver decomposta com baixo risco.',
    lastRoadmapAt: null
  },
  tacticalExecutor: {
    executorScore: 0,
    executionReadiness: 0,
    actionQueueDepth: 0,
    tacticalMode: 'staged-supervision',
    currentAction: 'Nenhuma ação tática ativa ainda.',
    nextAction: 'Aguardar roadmap estável antes de executar.',
    executionGuard: 'Rollback armado antes da primeira ação.',
    throughputTarget: 'conservador',
    tacticalDirective: 'Executar somente ações curtas, reversíveis e supervisionadas.',
    lastTacticalAt: null
  },
  executionFeedbackLoop: {
    feedbackScore: 0,
    loopReadiness: 0,
    signalFreshness: 0,
    correctionRate: 0,
    feedbackMode: 'observe-and-adjust',
    currentFeedback: 'Nenhum feedback de execução consolidado ainda.',
    nextAdjustment: 'Aguardar execução tática para coletar sinais reais.',
    confidencePulse: 'conservadora',
    feedbackDirective: 'Observar a execução, coletar sinais e ajustar em microciclos.',
    lastFeedbackAt: null
  },
  tacticalAdjuster: {
    adjusterScore: 0,
    adjustmentReadiness: 0,
    adaptationPressure: 0,
    adjustmentMode: 'stabilize-and-tune',
    currentAdjustment: 'Nenhum ajuste tático ativo ainda.',
    nextAdjustment: 'Aguardar sinais do feedback loop para recalibrar.',
    stabilityGuard: 'protegido',
    precisionIndex: 0,
    responseLatency: 0,
    riskCompensation: 'conservadora',
    adjusterDirective: 'Observar o feedback loop e aplicar microajustes sem romper a estabilidade.',
    lastAdjusterAt: null
  },
  autonomyCommander: {
    commanderScore: 0,
    commandReadiness: 0,
    commandMode: 'guided-command',
    operationalTempo: 'controlado',
    currentCommand: 'Nenhum comando autônomo ativo ainda.',
    nextCommand: 'Aguardar ajuste tático estável antes de comandar o próximo ciclo.',
    authorityGuard: 'supervisionado',
    alignmentIndex: 0,
    commanderDirective: 'Somente comandar mudanças quando estabilidade, alinhamento e prontidão estiverem acima do mínimo seguro.',
    lastCommanderAt: null
  },
  telemetry: {
    totalLoops: 0,
    successfulValidations: 0,
    failedValidations: 0,
    lastLoopAt: null
  },
  learningMemory: {
    wins: [],
    failures: [],
    lastValidatedChange: null
  },
  updatedAt: new Date().toISOString(),
  history: [],
  tasks: []
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_STATE,
    ...base,
    memoryDrivenDecision: {
      usedStablePattern: base?.memoryDrivenDecision?.usedStablePattern || 'Nenhum padrão usado ainda',
      avoidedPattern: base?.memoryDrivenDecision?.avoidedPattern || 'Nenhum padrão evitado ainda',
      decisionReason: base?.memoryDrivenDecision?.decisionReason || 'Nenhuma decisão orientada por memória ainda'
    },
    fallbackDecision: {
      triggered: Boolean(base?.fallbackDecision?.triggered),
      reason: base?.fallbackDecision?.reason || 'Nenhum fallback integrado ainda',
      previousStrategy: base?.fallbackDecision?.previousStrategy || 'Nenhuma',
      nextStrategy: base?.fallbackDecision?.nextStrategy || 'Nenhuma',
      confidence: Number(base?.fallbackDecision?.confidence || 0)
    },
    adaptivePriority: {
      highestPriorityAction: base?.adaptivePriority?.highestPriorityAction || 'monitorar_missao_ativa',
      downgradedActions: Array.isArray(base?.adaptivePriority?.downgradedActions) ? base.adaptivePriority.downgradedActions.slice(-10) : [],
      priorityReason: base?.adaptivePriority?.priorityReason || 'Nenhuma prioridade adaptativa integrada ainda',
      actionScores: base?.adaptivePriority?.actionScores || {}
    },
    selfHealing: {
      enabled: base?.selfHealing?.enabled ?? true,
      lastDetectedIssue: base?.selfHealing?.lastDetectedIssue || 'Nenhum problema detectado ainda',
      currentRecommendation: base?.selfHealing?.currentRecommendation || 'Aguardando varredura técnica',
      suggestedFiles: Array.isArray(base?.selfHealing?.suggestedFiles) ? base.selfHealing.suggestedFiles.slice(-12) : [],
      patchDraft: base?.selfHealing?.patchDraft || null,
      lastScanAt: base?.selfHealing?.lastScanAt || null
    },
    patchEngine: {
      lastPatchType: base?.patchEngine?.lastPatchType || 'none',
      patchObjective: base?.patchEngine?.patchObjective || 'Nenhum patch gerado ainda',
      patchRisk: base?.patchEngine?.patchRisk || 'baixo',
      patchStatus: base?.patchEngine?.patchStatus || 'idle',
      targetFiles: Array.isArray(base?.patchEngine?.targetFiles) ? base.patchEngine.targetFiles.slice(-12) : [],
      patchDraft: base?.patchEngine?.patchDraft || null,
      lastGeneratedAt: base?.patchEngine?.lastGeneratedAt || null
    },
    executionPlan: {
      activePlanId: base?.executionPlan?.activePlanId || null,
      planTitle: base?.executionPlan?.planTitle || 'Nenhum plano ativo',
      planStatus: base?.executionPlan?.planStatus || 'idle',
      currentStepIndex: Number(base?.executionPlan?.currentStepIndex ?? -1),
      steps: Array.isArray(base?.executionPlan?.steps) ? base.executionPlan.steps.slice(-20) : [],
      lastExecutionSummary: base?.executionPlan?.lastExecutionSummary || 'Nenhuma execução registrada ainda'
    },
    autonomyStrategist: {
      strategistScore: Number(base?.autonomyStrategist?.strategistScore || 0),
      goalClarity: Number(base?.autonomyStrategist?.goalClarity || 0),
      initiativeReadiness: Number(base?.autonomyStrategist?.initiativeReadiness || 0),
      strategicFocus: base?.autonomyStrategist?.strategicFocus || 'stabilize-and-learn',
      primaryObjective: base?.autonomyStrategist?.primaryObjective || 'Consolidar memória técnica e preparar metas supervisionadas.',
      expansionVector: base?.autonomyStrategist?.expansionVector || 'Incremental supervision',
      strategistDirective: base?.autonomyStrategist?.strategistDirective || 'Aguardar sinais validados antes de ampliar o escopo.',
      nextStrategicMove: base?.autonomyStrategist?.nextStrategicMove || 'Revisar aprendizado recente e definir um objetivo curto.',
      lastStrategistAt: base?.autonomyStrategist?.lastStrategistAt || null
    },
    metaGoalEngine: {
      metaGoalScore: Number(base?.metaGoalEngine?.metaGoalScore || 0),
      goalPortfolioHealth: Number(base?.metaGoalEngine?.goalPortfolioHealth || 0),
      autonomyAim: base?.metaGoalEngine?.autonomyAim || 'stability-first',
      goalTimeHorizon: base?.metaGoalEngine?.goalTimeHorizon || 'curto prazo',
      primaryMetaGoal: base?.metaGoalEngine?.primaryMetaGoal || 'Reduzir risco e consolidar aprendizado validado.',
      secondaryMetaGoal: base?.metaGoalEngine?.secondaryMetaGoal || 'Preparar novos ciclos de evolução supervisionada.',
      goalDirective: base?.metaGoalEngine?.goalDirective || 'Manter metas pequenas, reversíveis e orientadas por validação.',
      nextGoalReview: base?.metaGoalEngine?.nextGoalReview || 'Aguardar novo ciclo do estrategista antes de revisar metas.',
      lastMetaGoalAt: base?.metaGoalEngine?.lastMetaGoalAt || null
    },
    goalDecomposer: {
      decomposerScore: Number(base?.goalDecomposer?.decomposerScore || 0),
      goalBreakdownReadiness: Number(base?.goalDecomposer?.goalBreakdownReadiness || 0),
      subgoalCount: Number(base?.goalDecomposer?.subgoalCount || 0),
      executionComplexity: Number(base?.goalDecomposer?.executionComplexity || 0),
      primarySubgoal: base?.goalDecomposer?.primarySubgoal || 'Aguardar meta principal estável antes de decompor.',
      secondarySubgoal: base?.goalDecomposer?.secondarySubgoal || 'Nenhuma submeta derivada ainda.',
      nextSubgoal: base?.goalDecomposer?.nextSubgoal || 'Revisar portfólio e preparar uma etapa curta.',
      resourceNeed: base?.goalDecomposer?.resourceNeed || 'baixo',
      timePressure: base?.goalDecomposer?.timePressure || 'controlada',
      dependencyLoad: Number(base?.goalDecomposer?.dependencyLoad || 0),
      criticalBlocker: base?.goalDecomposer?.criticalBlocker || 'Nenhum bloqueio crítico detectado.',
      decomposerDirective: base?.goalDecomposer?.decomposerDirective || 'Só decompor metas quando houver clareza, validação e baixo risco.',
      lastDecomposerAt: base?.goalDecomposer?.lastDecomposerAt || null
    },
    executionRoadmap: {
      roadmapScore: Number(base?.executionRoadmap?.roadmapScore || 0),
      planReadiness: Number(base?.executionRoadmap?.planReadiness || 0),
      milestoneCount: Number(base?.executionRoadmap?.milestoneCount || 0),
      executionWindow: base?.executionRoadmap?.executionWindow || 'aguardando decomposição estável',
      currentMilestone: base?.executionRoadmap?.currentMilestone || 'Nenhum marco ativo ainda.',
      nextMilestone: base?.executionRoadmap?.nextMilestone || 'Aguardar submetas claras antes de abrir roadmap.',
      criticalPath: base?.executionRoadmap?.criticalPath || 'Nenhum caminho crítico definido.',
      resourceAllocation: base?.executionRoadmap?.resourceAllocation || 'conservadora',
      roadmapDirective: base?.executionRoadmap?.roadmapDirective || 'Só abrir roadmap quando a meta estiver decomposta com baixo risco.',
      lastRoadmapAt: base?.executionRoadmap?.lastRoadmapAt || null
    },
    tacticalExecutor: {
      executorScore: Number(base?.tacticalExecutor?.executorScore || 0),
      executionReadiness: Number(base?.tacticalExecutor?.executionReadiness || 0),
      actionQueueDepth: Number(base?.tacticalExecutor?.actionQueueDepth || 0),
      tacticalMode: base?.tacticalExecutor?.tacticalMode || 'staged-supervision',
      currentAction: base?.tacticalExecutor?.currentAction || 'Nenhuma ação tática ativa ainda.',
      nextAction: base?.tacticalExecutor?.nextAction || 'Aguardar roadmap estável antes de executar.',
      executionGuard: base?.tacticalExecutor?.executionGuard || 'Rollback armado antes da primeira ação.',
      throughputTarget: base?.tacticalExecutor?.throughputTarget || 'conservador',
      tacticalDirective: base?.tacticalExecutor?.tacticalDirective || 'Executar somente ações curtas, reversíveis e supervisionadas.',
      lastTacticalAt: base?.tacticalExecutor?.lastTacticalAt || null
    },
    executionFeedbackLoop: {
      feedbackScore: Number(base?.executionFeedbackLoop?.feedbackScore || 0),
      loopReadiness: Number(base?.executionFeedbackLoop?.loopReadiness || 0),
      signalFreshness: Number(base?.executionFeedbackLoop?.signalFreshness || 0),
      correctionRate: Number(base?.executionFeedbackLoop?.correctionRate || 0),
      feedbackMode: base?.executionFeedbackLoop?.feedbackMode || 'observe-and-adjust',
      currentFeedback: base?.executionFeedbackLoop?.currentFeedback || 'Nenhum feedback de execução consolidado ainda.',
      nextAdjustment: base?.executionFeedbackLoop?.nextAdjustment || 'Aguardar execução tática para coletar sinais reais.',
      confidencePulse: base?.executionFeedbackLoop?.confidencePulse || 'conservadora',
      feedbackDirective: base?.executionFeedbackLoop?.feedbackDirective || 'Observar a execução, coletar sinais e ajustar em microciclos.',
      lastFeedbackAt: base?.executionFeedbackLoop?.lastFeedbackAt || null
    },
    tacticalAdjuster: {
      adjusterScore: Number(base?.tacticalAdjuster?.adjusterScore || 0),
      adjustmentReadiness: Number(base?.tacticalAdjuster?.adjustmentReadiness || 0),
      adaptationPressure: Number(base?.tacticalAdjuster?.adaptationPressure || 0),
      adjustmentMode: base?.tacticalAdjuster?.adjustmentMode || 'stabilize-and-tune',
      currentAdjustment: base?.tacticalAdjuster?.currentAdjustment || 'Nenhum ajuste tático ativo ainda.',
      nextAdjustment: base?.tacticalAdjuster?.nextAdjustment || 'Aguardar sinais do feedback loop para recalibrar.',
      stabilityGuard: base?.tacticalAdjuster?.stabilityGuard || 'protegido',
      precisionIndex: Number(base?.tacticalAdjuster?.precisionIndex || 0),
      responseLatency: Number(base?.tacticalAdjuster?.responseLatency || 0),
      riskCompensation: base?.tacticalAdjuster?.riskCompensation || 'conservadora',
      adjusterDirective: base?.tacticalAdjuster?.adjusterDirective || 'Observar o feedback loop e aplicar microajustes sem romper a estabilidade.',
      lastAdjusterAt: base?.tacticalAdjuster?.lastAdjusterAt || null
    },
    autonomyCommander: {
      commanderScore: Number(base?.autonomyCommander?.commanderScore || 0),
      commandReadiness: Number(base?.autonomyCommander?.commandReadiness || 0),
      commandMode: base?.autonomyCommander?.commandMode || 'guided-command',
      operationalTempo: base?.autonomyCommander?.operationalTempo || 'controlado',
      currentCommand: base?.autonomyCommander?.currentCommand || 'Nenhum comando autônomo ativo ainda.',
      nextCommand: base?.autonomyCommander?.nextCommand || 'Aguardar ajuste tático estável antes de comandar o próximo ciclo.',
      authorityGuard: base?.autonomyCommander?.authorityGuard || 'supervisionado',
      alignmentIndex: Number(base?.autonomyCommander?.alignmentIndex || 0),
      commanderDirective: base?.autonomyCommander?.commanderDirective || 'Somente comandar mudanças quando estabilidade, alinhamento e prontidão estiverem acima do mínimo seguro.',
      lastCommanderAt: base?.autonomyCommander?.lastCommanderAt || null
    },
    telemetry: {
      totalLoops: Number(base?.telemetry?.totalLoops || 0),
      successfulValidations: Number(base?.telemetry?.successfulValidations || 0),
      failedValidations: Number(base?.telemetry?.failedValidations || 0),
      lastLoopAt: base?.telemetry?.lastLoopAt || null
    },
    learningMemory: {
      wins: Array.isArray(base?.learningMemory?.wins) ? base.learningMemory.wins.slice(-12) : [],
      failures: Array.isArray(base?.learningMemory?.failures) ? base.learningMemory.failures.slice(-12) : [],
      lastValidatedChange: base?.learningMemory?.lastValidatedChange || null
    },
    history: Array.isArray(base.history) ? base.history.slice(-30) : [],
    tasks: Array.isArray(base.tasks) ? base.tasks.slice(-15) : []
  };
}

export async function getAutonomyState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function makeTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isGreeting(message = '') {
  const normalized = String(message || '').toLowerCase().trim().replace(/[!?.;,]/g, '');
  return ['oi', 'olá', 'ola', 'oi megan', 'olá megan', 'ola megan', 'bom dia', 'boa tarde', 'boa noite'].includes(normalized);
}

function chooseMemoryDrivenDecision(decisionMemory) {
  const stable = Array.isArray(decisionMemory?.stablePatterns) ? decisionMemory.stablePatterns[0] : null;
  const unstable = Array.isArray(decisionMemory?.unstablePatterns) ? decisionMemory.unstablePatterns[0] : null;
  return {
    usedStablePattern: stable ? `${stable.brain} / ${stable.patch} / ${stable.plan}` : 'Nenhum padrão estável disponível',
    avoidedPattern: unstable ? `${unstable.brain} / ${unstable.patch} / ${unstable.plan}` : 'Nenhum padrão instável registrado',
    decisionReason: stable
      ? 'O loop usou o padrão estável mais recente como referência de decisão.'
      : 'O loop decidiu sem padrão estável consolidado disponível.'
  };
}

function buildBrainAwarePlan(message = '', brainState = {}, memoryDecision = {}) {
  const text = String(message || '');

  if (!text.trim()) {
    return {
      activeMission: 'Operar como núcleo central da Megan OS',
      currentProblem: 'Nenhum',
      nextStep: 'Aguardar nova mensagem do Luiz',
      priorityNow: 'monitorar_missao_ativa'
    };
  }

  if (isGreeting(text)) {
    return {
      activeMission: 'Receber e orientar o próximo objetivo do Luiz',
      currentProblem: 'Objetivo ainda não detalhado',
      nextStep: 'Perguntar o que Luiz quer fazer agora',
      priorityNow: 'coletar_objetivo'
    };
  }

  return {
    activeMission: `Executar missão com priorização adaptativa: ${text.slice(0, 120)}`,
    currentProblem: 'Missão recebida e em análise adaptativa',
    nextStep: `Executar primeiro a ação com maior score. Referência: ${memoryDecision.usedStablePattern}`,
    priorityNow: 'executar_prioridade_maxima'
  };
}

function createTasksFromMission(message = '', brainState = {}) {
  const text = String(message || '').trim();
  const now = new Date().toISOString();
  const brain = String(brainState?.activeBrain || 'operational');

  if (!text) return [];

  return [
    {
      id: makeTaskId(),
      title: `Rotear missão para o brain ${brain}`,
      type: 'brain_routing',
      priority: 98,
      status: 'pending',
      createdAt: now
    },
    {
      id: makeTaskId(),
      title: 'Consultar memória consolidada e fallback inteligente',
      type: 'decision_fallback',
      priority: 99,
      status: 'pending',
      createdAt: now
    },
    {
      id: makeTaskId(),
      title: 'Executar prioridade adaptativa máxima do ciclo',
      type: 'adaptive_priority',
      priority: 100,
      status: 'pending',
      createdAt: now
    }
  ];
}

function mergeTasks(existingTasks = [], incomingTasks = [], highestPriorityAction = 'adaptive_priority') {
  const preserved = Array.isArray(existingTasks)
    ? existingTasks.filter((task) => task && typeof task === 'object' && task.status !== 'done').slice(-8)
    : [];

  const merged = [...preserved, ...incomingTasks];

  return merged
    .sort((a, b) => {
      const aBoost = String(a?.type || '') === highestPriorityAction ? 1000 : 0;
      const bBoost = String(b?.type || '') === highestPriorityAction ? 1000 : 0;
      return (bBoost + (b.priority || 0)) - (aBoost + (a.priority || 0));
    })
    .slice(0, 12);
}

function advanceTaskQueue(tasks = []) {
  const cloned = Array.isArray(tasks) ? tasks.map((task) => ({ ...task })) : [];
  const runningIndex = cloned.findIndex((task) => task.status === 'running');
  if (runningIndex >= 0) {
    cloned[runningIndex].status = 'done';
    cloned[runningIndex].completedAt = new Date().toISOString();
  }
  const nextIndex = cloned.findIndex((task) => task.status === 'pending');
  if (nextIndex >= 0) {
    cloned[nextIndex].status = 'running';
    cloned[nextIndex].startedAt = new Date().toISOString();
  }
  return cloned;
}

function computeLoopSummary(state) {
  const pendingTasks = Array.isArray(state.tasks) ? state.tasks.filter((task) => task.status === 'pending') : [];
  const runningTask = Array.isArray(state.tasks) ? state.tasks.find((task) => task.status === 'running') : null;
  if (runningTask) return `Executando: ${runningTask.title}`;
  if (pendingTasks.length) return `Próxima tarefa: ${pendingTasks[0].title}`;
  return 'Núcleo aguardando nova missão';
}

function validateImprovement(state) {
  let score = 84;
  if (String(state?.adaptivePriority?.highestPriorityAction || '').length > 0) score += 4;
  if (String(state?.memoryDrivenDecision?.usedStablePattern || '').toLowerCase().includes('/')) score += 4;
  if (state?.fallbackDecision?.triggered) score += 2;
  if (['running', 'completed'].includes(String(state?.executionPlan?.planStatus || ''))) score += 4;
  score = Math.min(100, score);
  const passed = score >= 90;
  return {
    passed,
    score,
    result: passed
      ? `Validação com priorização adaptativa integrada aprovada com score ${score}.`
      : `Validação com priorização adaptativa integrada parcial com score ${score}.`
  };
}

function updateLearningMemory(state, passed, notes) {
  const entry = { notes, mission: state.activeMission, createdAt: new Date().toISOString() };
  const wins = Array.isArray(state?.learningMemory?.wins) ? [...state.learningMemory.wins] : [];
  const failures = Array.isArray(state?.learningMemory?.failures) ? [...state.learningMemory.failures] : [];
  if (passed) wins.unshift(entry);
  else failures.unshift(entry);
  return {
    wins: wins.slice(-12),
    failures: failures.slice(-12),
    lastValidatedChange: passed ? entry : state?.learningMemory?.lastValidatedChange || null
  };
}

export function buildAutonomyStrategist({ validationScore = 0, learningMemory = {}, adaptivePriority = {}, selfHealing = {}, patchEngine = {}, telemetry = {} } = {}) {
  const strategistScore = Math.max(0, Math.min(100, Math.round(
    (Number(validationScore || 0) * 0.34) +
    (Number(learningMemory?.confidence || 0) * 0.24) +
    (Math.max(0, 100 - Number(telemetry?.failedValidations || 0) * 12) * 0.12) +
    (Number(patchEngine?.patchStatus === 'ready' ? 85 : patchEngine?.patchStatus === 'generated' ? 62 : 38) * 0.14) +
    (Number(adaptivePriority?.highestPriorityAction ? 78 : 40) * 0.08) +
    (Number(selfHealing?.lastDetectedIssue ? 56 : 78) * 0.08)
  )));

  const goalClarity = Math.max(0, Math.min(100, Math.round(
    (Number(validationScore || 0) * 0.40) +
    (Number(learningMemory?.confidence || 0) * 0.25) +
    (Number(patchEngine?.patchObjective ? 75 : 35) * 0.20) +
    (Number(adaptivePriority?.priorityReason ? 70 : 45) * 0.15)
  )));

  const initiativeReadiness = Math.max(0, Math.min(100, Math.round(
    (Number(validationScore || 0) * 0.36) +
    (Number(learningMemory?.confidence || 0) * 0.18) +
    (Number(patchEngine?.patchRisk === 'baixo' ? 84 : patchEngine?.patchRisk === 'médio' ? 62 : 38) * 0.20) +
    (Math.max(0, 100 - Number(telemetry?.failedValidations || 0) * 10) * 0.14) +
    (Number(selfHealing?.lastDetectedIssue ? 52 : 78) * 0.12)
  )));

  let strategicFocus = 'stabilize-and-learn';
  if (initiativeReadiness >= 74 && goalClarity >= 70) strategicFocus = 'promote-safe-improvements';
  else if (Number(telemetry?.failedValidations || 0) >= 2) strategicFocus = 'contain-regression-risk';
  else if (Number(learningMemory?.confidence || 0) >= 72) strategicFocus = 'compound-winning-patterns';

  const objectiveMap = {
    'promote-safe-improvements': 'Promover melhorias aprovadas com rollback armado e impacto medido.',
    'contain-regression-risk': 'Conter regressões e reduzir risco antes de avançar novas promoções.',
    'compound-winning-patterns': 'Transformar correções vencedoras em padrões reutilizáveis de evolução.',
    'stabilize-and-learn': 'Consolidar memória técnica e preparar metas supervisionadas.'
  };

  const vectorMap = {
    'promote-safe-improvements': 'Controlled promotion',
    'contain-regression-risk': 'Risk containment',
    'compound-winning-patterns': 'Pattern compounding',
    'stabilize-and-learn': 'Incremental supervision'
  };

  const directiveMap = {
    'promote-safe-improvements': 'Promover apenas patches de baixo risco e observar a saúde pós-release.',
    'contain-regression-risk': 'Reduzir falhas recorrentes e reforçar rollback antes do próximo ciclo.',
    'compound-winning-patterns': 'Converter aprendizado validado em padrões menores e reutilizáveis.',
    'stabilize-and-learn': 'Coletar sinais, validar mudanças pequenas e só então ampliar o escopo.'
  };

  return {
    strategistScore,
    goalClarity,
    initiativeReadiness,
    strategicFocus,
    primaryObjective: objectiveMap[strategicFocus],
    expansionVector: vectorMap[strategicFocus],
    strategistDirective: directiveMap[strategicFocus],
    nextStrategicMove: strategicFocus === 'promote-safe-improvements'
      ? 'Preparar uma meta curta de promoção supervisionada.'
      : strategicFocus === 'contain-regression-risk'
        ? 'Executar contenção, reduzir falhas e revisar metas.'
        : 'Revisar aprendizado recente e definir um objetivo curto.',
    lastStrategistAt: new Date().toISOString()
  };
}

function buildMetaGoalEngine({ autonomyStrategist = {}, learningMemory = {}, validationScore = 0, telemetry = {}, patchEngine = {} } = {}) {
  const metaGoalScore = Math.max(0, Math.min(100, Math.round(
    (Number(autonomyStrategist?.strategistScore || 0) * 0.38) +
    (Number(autonomyStrategist?.goalClarity || 0) * 0.20) +
    (Number(learningMemory?.confidence || 0) * 0.18) +
    (Number(validationScore || 0) * 0.14) +
    (Math.max(0, 100 - Number(telemetry?.failedValidations || 0) * 10) * 0.10)
  )));

  const goalPortfolioHealth = Math.max(0, Math.min(100, Math.round(
    (Number(autonomyStrategist?.initiativeReadiness || 0) * 0.30) +
    (Number(learningMemory?.confidence || 0) * 0.24) +
    (Number(validationScore || 0) * 0.20) +
    (Number(patchEngine?.patchStatus === 'ready' ? 82 : patchEngine?.patchStatus === 'generated' ? 64 : 40) * 0.14) +
    (Math.max(0, 100 - Number(telemetry?.failedValidations || 0) * 12) * 0.12)
  )));

  const focus = String(autonomyStrategist?.strategicFocus || '');
  let autonomyAim = 'stability-first';
  if (focus === 'promote-safe-improvements') autonomyAim = 'guided-promotion';
  else if (focus === 'compound-winning-patterns') autonomyAim = 'pattern-expansion';
  else if (focus === 'contain-regression-risk') autonomyAim = 'risk-containment';

  const goalTimeHorizon = goalPortfolioHealth >= 74 ? 'curto a médio prazo' : goalPortfolioHealth >= 58 ? 'curto prazo' : 'imediato';
  const primaryMetaGoal = autonomyAim === 'guided-promotion'
    ? 'Promover o melhor patch validado com segurança e observabilidade.'
    : autonomyAim === 'pattern-expansion'
      ? 'Expandir padrões vencedores em objetivos menores reutilizáveis.'
      : autonomyAim === 'risk-containment'
        ? 'Conter regressões antes de abrir novas metas de promoção.'
        : 'Reduzir risco e consolidar aprendizado validado.';
  const secondaryMetaGoal = autonomyAim === 'pattern-expansion'
    ? 'Estruturar portfólio de metas sequenciais com baixo risco.'
    : 'Preparar novos ciclos de evolução supervisionada.';
  const goalDirective = autonomyAim === 'risk-containment'
    ? 'Segurar novas promoções, reduzir falhas e reavaliar o portfólio.'
    : 'Manter metas pequenas, reversíveis e orientadas por validação.';
  const nextGoalReview = autonomyAim === 'guided-promotion'
    ? 'Revisar janela de promoção após o próximo ciclo de validação.'
    : 'Aguardar novo ciclo do estrategista antes de revisar metas.';

  return {
    metaGoalScore,
    goalPortfolioHealth,
    autonomyAim,
    goalTimeHorizon,
    primaryMetaGoal,
    secondaryMetaGoal,
    goalDirective,
    nextGoalReview,
    lastMetaGoalAt: new Date().toISOString()
  };
}


function buildGoalDecomposer({ metaGoalEngine = {}, autonomyStrategist = {}, learningMemory = {}, patchEngine = {}, validationScore = 0, executionPlan = {}, selfHealing = {} } = {}) {
  const decomposerScore = Math.max(0, Math.min(100, Math.round(
    (Number(metaGoalEngine?.metaGoalScore || 0) * 0.34) +
    (Number(metaGoalEngine?.goalPortfolioHealth || 0) * 0.18) +
    (Number(autonomyStrategist?.goalClarity || 0) * 0.16) +
    (Number(validationScore || 0) * 0.12) +
    (Number(learningMemory?.confidence || 0) * 0.10) +
    (Number(patchEngine?.patchRisk === 'baixo' ? 82 : patchEngine?.patchRisk === 'médio' ? 58 : 34) * 0.10)
  )));

  const goalBreakdownReadiness = Math.max(0, Math.min(100, Math.round(
    (Number(metaGoalEngine?.goalPortfolioHealth || 0) * 0.32) +
    (Number(autonomyStrategist?.initiativeReadiness || 0) * 0.24) +
    (Number(validationScore || 0) * 0.18) +
    (Number(learningMemory?.confidence || 0) * 0.14) +
    (Number(selfHealing?.lastDetectedIssue ? 46 : 74) * 0.12)
  )));

  const executionComplexity = Math.max(20, Math.min(95, Math.round(
    100 - ((Number(goalBreakdownReadiness || 0) * 0.42) +
    (Number(validationScore || 0) * 0.20) +
    (Number(learningMemory?.confidence || 0) * 0.12) +
    (Number(patchEngine?.patchStatus === 'ready' ? 76 : patchEngine?.patchStatus === 'generated' ? 58 : 38) * 0.14) +
    (Number(executionPlan?.planStatus === 'running' ? 52 : executionPlan?.planStatus === 'completed' ? 74 : 48) * 0.12))
  )));

  const dependencyLoad = Math.max(1, Math.min(10, Math.round(
    (Number(executionComplexity || 0) / 16) +
    (String(metaGoalEngine?.autonomyAim || '').includes('pattern') ? 2 : 1)
  )));

  const subgoalCount = Math.max(2, Math.min(6, Math.round(
    2 + (Number(goalBreakdownReadiness || 0) / 26)
  )));

  const aim = String(metaGoalEngine?.autonomyAim || 'stability-first');
  const focus = String(autonomyStrategist?.strategicFocus || 'stabilize-and-learn');

  let primarySubgoal = 'Mapear a meta principal em uma etapa reversível e validável.';
  let secondarySubgoal = 'Preparar observabilidade mínima antes de ampliar o escopo.';
  let nextSubgoal = 'Selecionar um ajuste pequeno com rollback garantido.';

  if (aim === 'guided-promotion') {
    primarySubgoal = 'Preparar o patch mais seguro para promoção supervisionada.';
    secondarySubgoal = 'Fechar a cadeia de validação e monitorar a saúde pós-release.';
    nextSubgoal = 'Separar validação, promoção e observabilidade em três etapas curtas.';
  } else if (aim === 'pattern-expansion') {
    primarySubgoal = 'Transformar correções vencedoras em módulos menores reutilizáveis.';
    secondarySubgoal = 'Priorizar um padrão de aprendizado com baixo risco de regressão.';
    nextSubgoal = 'Isolar um padrão vencedor e convertê-lo em uma ação replicável.';
  } else if (aim === 'risk-containment' || focus === 'contain-regression-risk') {
    primarySubgoal = 'Conter regressões antes de abrir novas frentes de evolução.';
    secondarySubgoal = 'Reduzir o raio de impacto e reforçar rollback.';
    nextSubgoal = 'Executar uma etapa de estabilização antes de decompor novas metas.';
  }

  const resourceNeed = executionComplexity >= 72 ? 'alto' : executionComplexity >= 52 ? 'médio' : 'baixo';
  const timePressure = goalBreakdownReadiness >= 74 ? 'controlada' : goalBreakdownReadiness >= 56 ? 'moderada' : 'alta';
  const criticalBlocker = goalBreakdownReadiness < 50
    ? 'Clareza insuficiente da meta para decomposição segura.'
    : resourceNeed === 'alto'
      ? 'Carga de execução e dependências acima do ideal para abrir muitas submetas.'
      : 'Nenhum bloqueio crítico detectado.';

  const decomposerDirective = criticalBlocker === 'Nenhum bloqueio crítico detectado.'
    ? 'Executar a decomposição em submetas pequenas, sequenciais e reversíveis.'
    : 'Reduzir risco e clarificar a meta antes de aumentar a decomposição.';

  return {
    decomposerScore,
    goalBreakdownReadiness,
    subgoalCount,
    executionComplexity,
    primarySubgoal,
    secondarySubgoal,
    nextSubgoal,
    resourceNeed,
    timePressure,
    dependencyLoad,
    criticalBlocker,
    decomposerDirective,
    lastDecomposerAt: new Date().toISOString()
  };
}

function buildExecutionRoadmap({ goalDecomposer = {}, metaGoalEngine = {}, autonomyStrategist = {}, executionPlan = {}, patchEngine = {}, validationScore = 0 } = {}) {
  const roadmapScore = Math.max(0, Math.min(100, Math.round(
    (Number(goalDecomposer?.decomposerScore || 0) * 0.30) +
    (Number(goalDecomposer?.goalBreakdownReadiness || 0) * 0.24) +
    (Number(metaGoalEngine?.goalPortfolioHealth || 0) * 0.16) +
    (Number(autonomyStrategist?.initiativeReadiness || 0) * 0.12) +
    (Number(validationScore || 0) * 0.10) +
    (Number(patchEngine?.patchRisk === 'baixo' ? 82 : patchEngine?.patchRisk === 'médio' ? 58 : 34) * 0.08)
  )));

  const planReadiness = Math.max(0, Math.min(100, Math.round(
    (Number(goalDecomposer?.goalBreakdownReadiness || 0) * 0.36) +
    (Number(metaGoalEngine?.metaGoalScore || 0) * 0.22) +
    (Number(autonomyStrategist?.goalClarity || 0) * 0.16) +
    (Number(validationScore || 0) * 0.14) +
    (Number(executionPlan?.planStatus === 'running' ? 72 : executionPlan?.planStatus === 'completed' ? 82 : 46) * 0.12)
  )));

  const milestoneCount = Math.max(3, Math.min(7, Math.round(3 + (Number(goalDecomposer?.subgoalCount || 0) / 1.5))));
  const executionWindow = planReadiness >= 75 ? 'janela supervisionada curta' : planReadiness >= 58 ? 'janela curta com contenção' : 'janela bloqueada para estabilização';
  const currentMilestone = planReadiness >= 72
    ? `Executar ${goalDecomposer?.primarySubgoal || 'submeta principal'} com rollback armado.`
    : 'Consolidar decomposição e reduzir bloqueios antes de executar.';
  const nextMilestone = goalDecomposer?.nextSubgoal || 'Preparar a próxima etapa validável.';
  const criticalPath = String(goalDecomposer?.criticalBlocker || '').includes('Nenhum')
    ? 'Validação → sandbox → promoção supervisionada → observabilidade'
    : `Resolver bloqueio: ${goalDecomposer?.criticalBlocker || 'indefinido'}`;
  const resourceAllocation = Number(goalDecomposer?.executionComplexity || 0) >= 72 ? 'defensiva' : Number(goalDecomposer?.dependencyLoad || 0) >= 6 ? 'balanceada' : 'leve';
  const roadmapDirective = planReadiness >= 72
    ? 'Executar o roadmap em marcos curtos, reversíveis e com observabilidade total.'
    : 'Segurar execução, reduzir bloqueios e só então abrir os marcos do roadmap.';

  return {
    roadmapScore,
    planReadiness,
    milestoneCount,
    executionWindow,
    currentMilestone,
    nextMilestone,
    criticalPath,
    resourceAllocation,
    roadmapDirective,
    lastRoadmapAt: new Date().toISOString()
  };
}



function buildTacticalExecutor({ executionRoadmap = {}, goalDecomposer = {}, metaGoalEngine = {}, autonomyStrategist = {}, patchEngine = {}, validationScore = 0, tasks = [] } = {}) {
  const executorScore = Math.max(0, Math.min(100, Math.round(
    (Number(executionRoadmap?.roadmapScore || 0) * 0.34) +
    (Number(executionRoadmap?.planReadiness || 0) * 0.24) +
    (Number(goalDecomposer?.goalBreakdownReadiness || 0) * 0.14) +
    (Number(metaGoalEngine?.metaGoalScore || 0) * 0.10) +
    (Number(autonomyStrategist?.initiativeReadiness || 0) * 0.10) +
    (Number(validationScore || 0) * 0.08)
  )));

  const executionReadiness = Math.max(0, Math.min(100, Math.round(
    (Number(executionRoadmap?.planReadiness || 0) * 0.38) +
    (Number(goalDecomposer?.decomposerScore || 0) * 0.18) +
    (Number(validationScore || 0) * 0.18) +
    (Number(patchEngine?.patchRisk === 'baixo' ? 84 : patchEngine?.patchRisk === 'médio' ? 60 : 34) * 0.14) +
    (Number(autonomyStrategist?.goalClarity || 0) * 0.12)
  )));

  const actionQueueDepth = Math.max(1, Math.min(9, Math.round(
    (Array.isArray(tasks) ? tasks.filter((task) => task?.status === 'pending' || task?.status === 'running').length : 0) ||
    Math.max(1, Number(executionRoadmap?.milestoneCount || 0) - 1)
  )));

  let tacticalMode = 'staged-supervision';
  if (executionReadiness >= 78 && String(patchEngine?.patchRisk || 'baixo') === 'baixo') tacticalMode = 'priority-execution';
  else if (executionReadiness < 52) tacticalMode = 'stabilization-hold';
  else if (Number(goalDecomposer?.executionComplexity || 0) >= 70) tacticalMode = 'guarded-slicing';

  const currentAction = tacticalMode === 'priority-execution'
    ? `Executar ${executionRoadmap?.currentMilestone || 'marco principal'} com rollback armado.`
    : tacticalMode === 'guarded-slicing'
      ? `Fatiar ${goalDecomposer?.primarySubgoal || 'submeta principal'} em ações menores.`
      : 'Segurar avanço e reduzir risco antes da primeira execução tática.';

  const nextAction = tacticalMode === 'priority-execution'
    ? executionRoadmap?.nextMilestone || 'Promover próxima etapa após validar o marco atual.'
    : tacticalMode === 'guarded-slicing'
      ? goalDecomposer?.nextSubgoal || 'Reduzir escopo e preparar a próxima ação curta.'
      : 'Reforçar validação, diminuir bloqueios e revisar o roadmap.';

  const executionGuard = String(patchEngine?.patchRisk || 'baixo') === 'baixo'
    ? 'Rollback armado, observabilidade ativa e promoção supervisionada.'
    : 'Containment ativo, rollback imediato e revisão antes de executar.';

  const throughputTarget = executionReadiness >= 72 ? 'moderado' : executionReadiness >= 56 ? 'controlado' : 'conservador';
  const tacticalDirective = tacticalMode === 'priority-execution'
    ? 'Executar a próxima ação com prioridade alta, janela curta e verificação pós-ação.'
    : tacticalMode === 'guarded-slicing'
      ? 'Dividir a execução em microações até reduzir complexidade e dependências.'
      : 'Congelar execução, estabilizar o núcleo e só então retomar o plano.';

  return {
    executorScore,
    executionReadiness,
    actionQueueDepth,
    tacticalMode,
    currentAction,
    nextAction,
    executionGuard,
    throughputTarget,
    tacticalDirective,
    lastTacticalAt: new Date().toISOString()
  };
}



function buildExecutionFeedbackLoop({ tacticalExecutor = {}, executionRoadmap = {}, goalDecomposer = {}, validationScore = 0, telemetry = {}, tasks = [] } = {}) {
  const activeCount = Array.isArray(tasks)
    ? tasks.filter((task) => ['pending', 'running', 'done'].includes(String(task?.status || ''))).length
    : 0;

  const feedbackScore = Math.max(0, Math.min(100, Math.round(
    (Number(tacticalExecutor?.executorScore || 0) * 0.32) +
    (Number(tacticalExecutor?.executionReadiness || 0) * 0.24) +
    (Number(executionRoadmap?.planReadiness || 0) * 0.16) +
    (Number(validationScore || 0) * 0.14) +
    (Math.min(100, activeCount * 18) * 0.14)
  )));

  const loopReadiness = Math.max(0, Math.min(100, Math.round(
    (Number(tacticalExecutor?.executionReadiness || 0) * 0.42) +
    (Number(executionRoadmap?.roadmapScore || 0) * 0.18) +
    (Number(goalDecomposer?.decomposerScore || 0) * 0.16) +
    (Number(validationScore || 0) * 0.12) +
    (Math.min(100, Number(telemetry?.totalLoops || 0) * 6) * 0.12)
  )));

  const signalFreshness = Math.max(0, Math.min(100, Math.round(
    (Math.min(100, activeCount * 22) * 0.38) +
    (Math.min(100, Number(telemetry?.totalLoops || 0) * 5) * 0.22) +
    (Number(tacticalExecutor?.actionQueueDepth || 0) * 7 * 0.20) +
    (Number(validationScore || 0) * 0.20)
  )));

  const success = Number(telemetry?.successfulValidations || 0);
  const failed = Number(telemetry?.failedValidations || 0);
  const denominator = Math.max(1, success + failed);
  const correctionRate = Math.max(0, Math.min(100, Math.round((success / denominator) * 100)));

  let feedbackMode = 'observe-and-adjust';
  if (loopReadiness >= 76 && correctionRate >= 60) feedbackMode = 'adaptive-closed-loop';
  else if (Number(tacticalExecutor?.actionQueueDepth || 0) >= 6) feedbackMode = 'queue-pressure-control';
  else if (feedbackScore < 48) feedbackMode = 'stability-feedback';

  const currentFeedback = feedbackMode === 'adaptive-closed-loop'
    ? `Execução respondendo bem ao feedback. Ajustes curtos em ${tacticalExecutor?.currentAction || 'ação principal'} estão convergindo.`
    : feedbackMode === 'queue-pressure-control'
      ? `Fila tática pressionada em ${tacticalExecutor?.currentAction || 'execução atual'}. Feedback deve reduzir profundidade antes da próxima ação.`
      : 'Sinais ainda conservadores. Coletar mais execução real antes de ampliar o ciclo.';

  const nextAdjustment = feedbackMode === 'adaptive-closed-loop'
    ? `Aplicar microajuste sobre ${tacticalExecutor?.nextAction || 'próxima ação'} e medir resposta em um ciclo curto.`
    : feedbackMode === 'queue-pressure-control'
      ? 'Reduzir fila ativa, confirmar feedback válido e só então liberar nova ação.'
      : 'Executar uma ação curta supervisionada para alimentar o loop com sinal confiável.';

  const confidencePulse = correctionRate >= 75 ? 'alta' : correctionRate >= 50 ? 'moderada' : 'conservadora';
  const feedbackDirective = feedbackMode === 'adaptive-closed-loop'
    ? 'Fechar o loop com observação curta, ajuste leve e validação logo após a execução.'
    : feedbackMode === 'queue-pressure-control'
      ? 'Usar feedback para aliviar pressão da fila, reordenar ações e preservar reversibilidade.'
      : 'Manter feedback em modo observação até existir execução suficiente para correção confiável.';

  return {
    feedbackScore,
    loopReadiness,
    signalFreshness,
    correctionRate,
    feedbackMode,
    currentFeedback,
    nextAdjustment,
    confidencePulse,
    feedbackDirective,
    lastFeedbackAt: new Date().toISOString()
  };
}

function buildTacticalAdjuster({ executionFeedbackLoop = {}, tacticalExecutor = {}, executionRoadmap = {}, goalDecomposer = {}, telemetry = {}, tasks = [] } = {}) {
  const queueDepth = Array.isArray(tasks) ? tasks.filter((task) => ['pending', 'running'].includes(String(task?.status || ''))).length : 0;
  const adjusterScore = Math.max(0, Math.min(100, Math.round(
    (Number(executionFeedbackLoop?.feedbackScore || 0) * 0.34) +
    (Number(executionFeedbackLoop?.loopReadiness || 0) * 0.24) +
    (Number(tacticalExecutor?.executorScore || 0) * 0.18) +
    (Number(tacticalExecutor?.executionReadiness || 0) * 0.12) +
    (queueDepth <= 4 ? 12 : Math.max(0, 12 - (queueDepth - 4) * 3))
  )));
  const adaptationPressure = Math.max(0, Math.min(100, Math.round(
    (Number(executionFeedbackLoop?.correctionRate || 0) * 0.45) +
    (queueDepth * 6) +
    ((100 - Number(executionFeedbackLoop?.signalFreshness || 0)) * 0.25)
  )));
  const adjustmentReadiness = Math.max(0, Math.min(100, Math.round(
    (adjusterScore * 0.52) +
    (Number(executionRoadmap?.planReadiness || 0) * 0.18) +
    (Number(goalDecomposer?.goalBreakdownReadiness || 0) * 0.15) +
    (Number(executionFeedbackLoop?.signalFreshness || 0) * 0.15)
  )));
  const precisionIndex = Math.max(0, Math.min(100, Math.round(
    (Number(executionFeedbackLoop?.signalFreshness || 0) * 0.55) +
    (Number(executionFeedbackLoop?.confidencePulse || '').includes?.('alta') ? 15 : 0) +
    (Number(tacticalExecutor?.executionReadiness || 0) * 0.30)
  )));
  const responseLatency = Math.max(0, Math.min(100, Math.round(100 - ((queueDepth * 8) + (100 - Number(executionFeedbackLoop?.loopReadiness || 0)) * 0.35))));
  const stabilityGuard = adaptationPressure >= 72 ? 'armado' : adjusterScore >= 65 ? 'estável' : 'conservador';
  const riskCompensation = adaptationPressure >= 70 ? 'contenção ativa' : precisionIndex >= 70 ? 'microajuste preciso' : 'compensação gradual';
  const adjustmentMode = adaptationPressure >= 70
    ? 'contain-and-correct'
    : adjusterScore >= 70
      ? 'precision-tune'
      : 'observe-and-stabilize';
  const currentAdjustment = adaptationPressure >= 70
    ? 'Reduzir pressão adaptativa e segurar mudanças de maior risco.'
    : adjusterScore >= 70
      ? 'Aplicar microajustes na execução atual com baixo raio de impacto.'
      : 'Manter observação contínua até a próxima janela de ajuste.';
  const nextAdjustment = responseLatency < 45
    ? 'Diminuir a fila ativa antes da próxima correção tática.'
    : precisionIndex < 55
      ? 'Refinar sinais do feedback loop para aumentar precisão.'
      : 'Promover próximo ajuste tático supervisionado.';
  const adjusterDirective = stabilityGuard === 'armado'
    ? 'Priorizar estabilidade, conter a pressão e adiar mudanças agressivas.'
    : adjustmentMode === 'precision-tune'
      ? 'Executar microajustes com precisão e validar impacto logo após a ação.'
      : 'Continuar observando sinais e preparar próximo ajuste controlado.';
  return {
    adjusterScore,
    adjustmentReadiness,
    adaptationPressure,
    adjustmentMode,
    currentAdjustment,
    nextAdjustment,
    stabilityGuard,
    precisionIndex,
    responseLatency,
    riskCompensation,
    adjusterDirective,
    lastAdjusterAt: new Date().toISOString()
  };
}


function buildAutonomyCommander({ tacticalAdjuster = {}, executionFeedbackLoop = {}, tacticalExecutor = {}, executionRoadmap = {}, metaGoalEngine = {}, autonomyStrategist = {}, telemetry = {}, tasks = [] } = {}) {
  const queueDepth = Array.isArray(tasks) ? tasks.filter((task) => ['pending', 'running'].includes(String(task?.status || ''))).length : 0;
  const commanderScore = Math.max(0, Math.min(100, Math.round(
    (Number(tacticalAdjuster?.adjusterScore || 0) * 0.28) +
    (Number(tacticalAdjuster?.adjustmentReadiness || 0) * 0.18) +
    (Number(executionFeedbackLoop?.feedbackScore || 0) * 0.16) +
    (Number(tacticalExecutor?.executorScore || 0) * 0.14) +
    (Number(executionRoadmap?.roadmapScore || 0) * 0.12) +
    (Number(metaGoalEngine?.metaGoalScore || 0) * 0.06) +
    (Number(autonomyStrategist?.strategistScore || 0) * 0.06)
  )));
  const commandReadiness = Math.max(0, Math.min(100, Math.round(
    (commanderScore * 0.46) +
    (Number(tacticalAdjuster?.precisionIndex || 0) * 0.16) +
    (Number(executionFeedbackLoop?.loopReadiness || 0) * 0.14) +
    (Number(tacticalExecutor?.executionReadiness || 0) * 0.12) +
    (Number(executionRoadmap?.planReadiness || 0) * 0.12)
  )));
  const alignmentIndex = Math.max(0, Math.min(100, Math.round(
    (Number(metaGoalEngine?.goalPortfolioHealth || 0) * 0.34) +
    (Number(autonomyStrategist?.goalClarity || 0) * 0.33) +
    (Number(executionRoadmap?.planReadiness || 0) * 0.18) +
    (Number(tacticalAdjuster?.precisionIndex || 0) * 0.15)
  )));
  const failed = Number(telemetry?.failedValidations || 0);
  const successful = Number(telemetry?.successfulValidations || 0);
  const pressure = Math.max(0, Math.min(100, Math.round(
    (queueDepth * 8) +
    (failed * 7) +
    ((100 - Number(tacticalAdjuster?.adjustmentReadiness || 0)) * 0.25)
  )));

  let operationalTempo = 'controlado';
  if (pressure >= 70) operationalTempo = 'contenção';
  else if (commanderScore >= 74 && commandReadiness >= 70) operationalTempo = 'progressivo';
  else if (queueDepth <= 2 && successful >= failed) operationalTempo = 'estável';

  let commandMode = 'guided-command';
  if (pressure >= 70) commandMode = 'containment-command';
  else if (alignmentIndex >= 72 && commandReadiness >= 68) commandMode = 'strategic-command';
  else if (Number(tacticalAdjuster?.adjustmentReadiness || 0) >= 60) commandMode = 'tactical-command';

  const currentCommand = commandMode === 'containment-command'
    ? 'Conter pressão operacional, segurar expansão e preservar rollback.'
    : commandMode === 'strategic-command'
      ? `Comandar a próxima frente com foco em ${metaGoalEngine?.primaryMetaGoal || 'meta principal'} e ${executionRoadmap?.currentMilestone || 'milestone atual'}.`
      : 'Manter o comando supervisionado com ajustes táticos curtos e reversíveis.';
  const nextCommand = pressure >= 70
    ? 'Reordenar fila, reduzir ruído do ciclo e promover apenas ações de baixo risco.'
    : alignmentIndex < 55
      ? 'Revisar alinhamento entre estratégia, metas e roadmap antes de ampliar autoridade.'
      : `Avançar para ${tacticalExecutor?.nextAction || executionRoadmap?.nextMilestone || 'a próxima etapa'} com supervisão curta.`;
  const authorityGuard = pressure >= 70 ? 'restrito' : commanderScore >= 72 && alignmentIndex >= 68 ? 'assistido' : 'supervisionado';
  const commanderDirective = authorityGuard === 'restrito'
    ? 'Conter o comando, proteger estabilidade e liberar apenas microdecisões reversíveis.'
    : commandMode === 'strategic-command'
      ? 'Usar comando assistido para alinhar estratégia, metas, roadmap e execução sem romper governança.'
      : 'Conduzir o ciclo com comando supervisionado e feedback rápido antes de qualquer escalada.';

  return {
    commanderScore,
    commandReadiness,
    commandMode,
    operationalTempo,
    currentCommand,
    nextCommand,
    authorityGuard,
    alignmentIndex,
    commanderDirective,
    lastCommanderAt: new Date().toISOString()
  };
}


export async function processMission(message = "") {
  const current = await getAutonomyState();
  const brainState = await routeMissionToBrain(message);
  const decisionMemory = await getDecisionMemoryState();
  const memoryDecision = chooseMemoryDrivenDecision(decisionMemory);
  const adaptivePriorityState = await recomputeAdaptivePriority();
  const summary = buildBrainAwarePlan(message, brainState, memoryDecision);
  const mergedTasks = mergeTasks(
    current.tasks,
    createTasksFromMission(message, brainState),
    adaptivePriorityState?.highestPriorityAction || 'adaptive_priority'
  );

  const nextState = normalizeState({
    ...current,
    ...summary,
    status: 'Ativa',
    runtimeMode: 'Adaptive Priority Loop Integration',
    activeBrain: brainState.activeBrain,
    brainConfidence: brainState.confidence,
    brainReason: brainState.routingReason,
    memoryDrivenDecision: memoryDecision,
    adaptivePriority: {
      highestPriorityAction: adaptivePriorityState?.highestPriorityAction || 'adaptive_priority',
      downgradedActions: adaptivePriorityState?.downgradedActions || [],
      priorityReason: adaptivePriorityState?.priorityReason || 'Nenhuma prioridade adaptativa integrada ainda',
      actionScores: adaptivePriorityState?.actionScores || {}
    },
    currentExecution: 'planning',
    evolutionProgress: 68,
    lastUserMessage: String(message || '').trim(),
    updatedAt: new Date().toISOString(),
    tasks: mergedTasks,
    history: [
      ...current.history,
      { role: 'user', content: String(message || '').trim(), createdAt: new Date().toISOString() }
    ].filter((item) => item.content).slice(-30)
  });

  nextState.lastLoopSummary = computeLoopSummary(nextState);
  nextState.autonomyStrategist = buildAutonomyStrategist({
    validationScore: nextState.validationScore || current.validationScore || 0,
    learningMemory: nextState.learningMemory || current.learningMemory || {},
    adaptivePriority: nextState.adaptivePriority || {},
    selfHealing: nextState.selfHealing || current.selfHealing || {},
    patchEngine: nextState.patchEngine || current.patchEngine || {},
    telemetry: nextState.telemetry || current.telemetry || {}
  });
  nextState.metaGoalEngine = buildMetaGoalEngine({
    autonomyStrategist: nextState.autonomyStrategist,
    learningMemory: nextState.learningMemory || current.learningMemory || {},
    validationScore: nextState.validationScore || current.validationScore || 0,
    telemetry: nextState.telemetry || current.telemetry || {},
    patchEngine: nextState.patchEngine || current.patchEngine || {}
  });
  await writeState(nextState);
  nextState.goalDecomposer = buildGoalDecomposer({
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    learningMemory: nextState.learningMemory || current.learningMemory || {},
    patchEngine: nextState.patchEngine || current.patchEngine || {},
    validationScore: nextState.validationScore || current.validationScore || 0,
    executionPlan: nextState.executionPlan || current.executionPlan || {},
    selfHealing: nextState.selfHealing || current.selfHealing || {}
  });
  nextState.executionRoadmap = buildExecutionRoadmap({
    goalDecomposer: nextState.goalDecomposer,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    executionPlan: nextState.executionPlan || current.executionPlan || {},
    patchEngine: nextState.patchEngine || current.patchEngine || {},
    validationScore: nextState.validationScore || current.validationScore || 0
  });
  nextState.tacticalExecutor = buildTacticalExecutor({
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    patchEngine: nextState.patchEngine || current.patchEngine || {},
    validationScore: nextState.validationScore || current.validationScore || 0,
    tasks: nextState.tasks || []
  });
  nextState.executionFeedbackLoop = buildExecutionFeedbackLoop({
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    validationScore: nextState.validationScore || current.validationScore || 0,
    telemetry: nextState.telemetry || current.telemetry || {},
    tasks: nextState.tasks || []
  });
  nextState.tacticalAdjuster = buildTacticalAdjuster({
    executionFeedbackLoop: nextState.executionFeedbackLoop,
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    telemetry: nextState.telemetry || current.telemetry || {},
    tasks: nextState.tasks || []
  });
  nextState.autonomyCommander = buildAutonomyCommander({
    tacticalAdjuster: nextState.tacticalAdjuster,
    executionFeedbackLoop: nextState.executionFeedbackLoop,
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    telemetry: nextState.telemetry || current.telemetry || {},
    tasks: nextState.tasks || []
  });
  await writeState(nextState);
  return nextState;
}

export async function runAutonomyLoop() {
  const current = await getAutonomyState();
  const healing = await runSelfHealingScan();
  const patch = await generateSupervisedPatch();

  let planState = current.executionPlan;
  if (!planState?.activePlanId || ['idle', 'completed'].includes(String(planState?.planStatus || 'idle'))) {
    planState = await createExecutionPlanFromAutonomy();
  } else {
    planState = await advanceExecutionPlan();
  }

  const decisionMemory = await syncDecisionMemoryFromAutonomy();
  const memoryDecision = chooseMemoryDrivenDecision(decisionMemory);
  const fallbackState = await evaluateAndTriggerFallback();
  const adaptivePriorityState = await recomputeAdaptivePriority();

  let activeBrain = current.activeBrain;
  let brainReason = current.brainReason;
  if (fallbackState?.fallbackTriggered && fallbackState?.nextStrategy) {
    activeBrain = fallbackState.nextStrategy;
    brainReason = `Fallback aplicou troca automática para ${fallbackState.nextStrategy}.`;
  }

  const prioritizedTasks = mergeTasks(
    current.tasks,
    [],
    adaptivePriorityState?.highestPriorityAction || 'adaptive_priority'
  );
  const advancedTasks = advanceTaskQueue(prioritizedTasks);

  const nextState = normalizeState({
    ...current,
    activeBrain,
    brainReason,
    tasks: advancedTasks,
    currentExecution: advancedTasks.some((t) => t.status === 'running') ? 'running' : 'idle',
    runtimeMode: 'Adaptive Priority Loop Integration',
    memoryDrivenDecision: memoryDecision,
    fallbackDecision: {
      triggered: Boolean(fallbackState?.fallbackTriggered),
      reason: fallbackState?.fallbackReason || 'Nenhum fallback integrado ainda',
      previousStrategy: fallbackState?.previousStrategy || 'Nenhuma',
      nextStrategy: fallbackState?.nextStrategy || 'Nenhuma',
      confidence: Number(fallbackState?.confidence || 0)
    },
    adaptivePriority: {
      highestPriorityAction: adaptivePriorityState?.highestPriorityAction || 'adaptive_priority',
      downgradedActions: adaptivePriorityState?.downgradedActions || [],
      priorityReason: adaptivePriorityState?.priorityReason || 'Nenhuma prioridade adaptativa integrada ainda',
      actionScores: adaptivePriorityState?.actionScores || {}
    },
    selfHealing: {
      enabled: healing.enabled,
      lastDetectedIssue: healing.lastDetectedIssue,
      currentRecommendation: healing.currentRecommendation,
      suggestedFiles: healing.suggestedFiles,
      patchDraft: healing.patchDraft,
      lastScanAt: healing.lastScanAt
    },
    patchEngine: {
      lastPatchType: patch.lastPatchType,
      patchObjective: patch.patchObjective,
      patchRisk: patch.patchRisk,
      patchStatus: patch.patchStatus,
      targetFiles: patch.targetFiles,
      patchDraft: patch.patchDraft,
      lastGeneratedAt: patch.lastGeneratedAt
    },
    executionPlan: {
      activePlanId: planState.activePlanId,
      planTitle: planState.planTitle,
      planStatus: planState.planStatus,
      currentStepIndex: planState.currentStepIndex,
      steps: planState.steps,
      lastExecutionSummary: planState.lastExecutionSummary
    },
    priorityNow: adaptivePriorityState?.highestPriorityAction || 'adaptive_priority',
    bottleneckNow: healing.lastDetectedIssue || current.bottleneckNow,
    suggestedImprovement: patch.patchObjective || healing.currentRecommendation || current.suggestedImprovement,
    riskLevel: patch.patchRisk || current.riskLevel || 'baixo',
    evolutionProgress: Math.min(100, Number(current.evolutionProgress || 0) + 20),
    lastLoopSummary: computeLoopSummary({ ...current, tasks: advancedTasks }),
    updatedAt: new Date().toISOString(),
    telemetry: {
      totalLoops: Number(current?.telemetry?.totalLoops || 0) + 1,
      successfulValidations: Number(current?.telemetry?.successfulValidations || 0),
      failedValidations: Number(current?.telemetry?.failedValidations || 0),
      lastLoopAt: new Date().toISOString()
    }
  });

  const validation = validateImprovement(nextState);
  nextState.validationScore = validation.score;
  nextState.lastValidationResult = validation.result;
  nextState.learningMemory = updateLearningMemory(nextState, validation.passed, validation.result);
  if (validation.passed) nextState.telemetry.successfulValidations += 1;
  else nextState.telemetry.failedValidations += 1;

  nextState.autonomyStrategist = buildAutonomyStrategist({
    validationScore: nextState.validationScore || 0,
    learningMemory: nextState.learningMemory || {},
    adaptivePriority: nextState.adaptivePriority || {},
    selfHealing: nextState.selfHealing || {},
    patchEngine: nextState.patchEngine || {},
    telemetry: nextState.telemetry || {}
  });

  nextState.metaGoalEngine = buildMetaGoalEngine({
    autonomyStrategist: nextState.autonomyStrategist,
    learningMemory: nextState.learningMemory || {},
    validationScore: nextState.validationScore || 0,
    telemetry: nextState.telemetry || {},
    patchEngine: nextState.patchEngine || {}
  });
  nextState.goalDecomposer = buildGoalDecomposer({
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    learningMemory: nextState.learningMemory || {},
    patchEngine: nextState.patchEngine || {},
    validationScore: nextState.validationScore || 0,
    executionPlan: nextState.executionPlan || {},
    selfHealing: nextState.selfHealing || {}
  });
  nextState.executionRoadmap = buildExecutionRoadmap({
    goalDecomposer: nextState.goalDecomposer,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    executionPlan: nextState.executionPlan || {},
    patchEngine: nextState.patchEngine || {},
    validationScore: nextState.validationScore || 0
  });
  nextState.tacticalExecutor = buildTacticalExecutor({
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    patchEngine: nextState.patchEngine || {},
    validationScore: nextState.validationScore || 0,
    tasks: nextState.tasks || []
  });
  nextState.executionFeedbackLoop = buildExecutionFeedbackLoop({
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    validationScore: nextState.validationScore || 0,
    telemetry: nextState.telemetry || {},
    tasks: nextState.tasks || []
  });
  nextState.tacticalAdjuster = buildTacticalAdjuster({
    executionFeedbackLoop: nextState.executionFeedbackLoop,
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    goalDecomposer: nextState.goalDecomposer,
    telemetry: nextState.telemetry || {},
    tasks: nextState.tasks || []
  });
  nextState.autonomyCommander = buildAutonomyCommander({
    tacticalAdjuster: nextState.tacticalAdjuster,
    executionFeedbackLoop: nextState.executionFeedbackLoop,
    tacticalExecutor: nextState.tacticalExecutor,
    executionRoadmap: nextState.executionRoadmap,
    metaGoalEngine: nextState.metaGoalEngine,
    autonomyStrategist: nextState.autonomyStrategist,
    telemetry: nextState.telemetry || {},
    tasks: nextState.tasks || []
  });

  await writeState(nextState);
  return nextState;
}

export async function registerAssistantReply(reply = '') {
  const current = await getAutonomyState();
  const nextState = normalizeState({
    ...current,
    lastReply: String(reply || '').trim(),
    updatedAt: new Date().toISOString(),
    history: [
      ...current.history,
      { role: 'assistant', content: String(reply || '').trim(), createdAt: new Date().toISOString() }
    ].filter((item) => item.content).slice(-30)
  });
  await writeState(nextState);
  return nextState;
}

export async function setAutoLoopEnabled(enabled = false) {
  const current = await getAutonomyState();
  const nextState = normalizeState({
    ...current,
    autoLoopEnabled: Boolean(enabled),
    updatedAt: new Date().toISOString()
  });
  await writeState(nextState);
  return nextState;
}
