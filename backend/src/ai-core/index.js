import {
  getExternalWorkflowPolicyOverview,
  analyzeExternalWorkflowPolicy,
  applyExternalWorkflowPolicy
} from '../services/external-workflow-policy.service.js';
import {
  getPostLaunchSustainableGrowthGovernorOverview,
  syncPostLaunchSustainableGrowthGovernor,
  approvePostLaunchSustainableGrowthGovernor
} from '../services/post-launch-sustainable-growth-governor.service.js';
import {
  getControlCenterOverviewData,
  runControlCenterCycleData
} from '../services/control-center.service.js';
import {
  getPersonalOperatorOverview,
  runPlanDay,
  runNextAction,
  getPersonalOperatorStatusBlock
} from '../services/personal-operator.service.js';
import {
  getLivingIntentOrchestratorOverview,
  syncLivingIntentOrchestrator,
  runLivingIntentCommit
} from '../services/living-intent-orchestrator.service.js';
import {
  getExecutiveMemoryState,
  saveExecutiveMemory,
  buildExecutiveMemorySummary
} from '../services/executive-memory.service.js';
import {
  addPriorityQueueItem,
  updatePriorityQueueItem,
  getNextPriorityQueueItem,
  listPriorityQueue
} from '../services/priority-queue.service.js';
import {
  addDecisionLog,
  getDecisionLogHistory
} from '../services/decision-log.service.js';
import {
  getExecutionRuntimeOverview,
  resumeMissionExecution,
  runExecutionPulse,
  completeMissionExecution,
  reportExecutionBlocker
} from '../services/execution-runtime.service.js';
import { getMissionScore, recalculateMissionScore } from '../services/mission-score.service.js';
import { getDeadlockStatus, recoverDeadlock } from '../services/deadlock-detector.service.js';
import { getEvolutionPulseOverview, runEvolutionPulse } from '../services/evolution-pulse.service.js';
import { getMetaCognitionOverview, evaluateMetaCognition } from '../services/meta-cognition.service.js';
import { getPreflightSimulationOverview, runPreflightSimulation, selectPreventiveRoute } from '../services/preflight-simulation.service.js';
import { getRouteOutcomeMemoryOverview, recordRouteOutcome } from '../services/route-outcome-memory.service.js';
import { getAdaptiveRouteLearningOverview, retuneAdaptiveRouteLearning } from '../services/adaptive-route-learning.service.js';
import { getMissionPatternMemoryOverview, syncMissionPatternMemory } from '../services/mission-pattern-memory.service.js';
import { getContextStrategyOverview, evaluateContextStrategy, syncContextEffectivenessSnapshot } from '../services/context-strategy-engine.service.js';
import { getContextEffectivenessMemoryOverview, recordContextEffectiveness } from '../services/context-effectiveness-memory.service.js';
import { getPerformanceDropOverview, evaluatePerformanceDrop } from '../services/performance-drop-forecaster.service.js';
import { getSequencePatternMemoryOverview, syncSequencePatternMemory } from '../services/sequence-pattern-memory.service.js';
import { getActionChainOverview, evaluateActionChain, adaptActionOrder } from '../services/action-chain-orchestrator.service.js';
import { getDependencyGraphOverview, syncDependencyGraphMemory } from '../services/dependency-graph-memory.service.js';
import { getBottleneckForecastOverview, evaluateBottleneckForecast } from '../services/bottleneck-forecast.service.js';
import { getFlowOutcomeMemoryOverview, recordFlowOutcome } from '../services/flow-outcome-memory.service.js';
import { getWinningFlowSelectorOverview, evaluateWinningFlowSelector } from '../services/winning-flow-selector.service.js';
import { getOperationBenchmarkMemoryOverview, syncOperationBenchmarkMemory } from '../services/operation-benchmark-memory.service.js';
import { getChampionFlowReuseOverview, evaluateChampionFlowReuse } from '../services/champion-flow-reuse.service.js';
import { getOperationalTemplateMemoryOverview, syncOperationalTemplateMemory } from '../services/operational-template-memory.service.js';
import { getOperationTemplateAssemblerOverview, evaluateOperationTemplateAssembler } from '../services/operation-template-assembler.service.js';
import { getTemplateExecutionMemoryOverview, recordTemplateExecution } from '../services/template-execution-memory.service.js';
import { getTemplateAutotuneOverview, evaluateTemplateAutotune } from '../services/template-autotune.service.js';
import { getModularTemplateMemoryOverview, syncModularTemplateMemory } from '../services/modular-template-memory.service.js';
import { getHybridTemplateComposerOverview, evaluateHybridTemplateComposer } from '../services/hybrid-template-composer.service.js';
import { getModulePerformanceMemoryOverview, syncModulePerformanceMemory } from '../services/module-performance-memory.service.js';
import { getModuleAutorebuildOverview, evaluateModuleAutorebuild } from '../services/module-autorebuild.service.js';
import { getModuleFunctionBenchmarkOverview, syncModuleFunctionBenchmark } from '../services/module-function-benchmark.service.js';
import { getModulePieceSelectorOverview, evaluateModulePieceSelector } from '../services/module-piece-selector.service.js';
import { getDashboardActivityFeed, recordDashboardActivity, syncDashboardHeartbeat } from '../services/dashboard-activity-feed.service.js';

function normalizeMessage(value) {
  return String(value || '').trim();
}

function buildRequestedActions({ message = '', controlOverview = null }) {
  const text = normalizeMessage(message).toLowerCase();
  const recommended = Array.isArray(controlOverview?.recommendedActions)
    ? controlOverview.recommendedActions
    : [];

  const requested = new Set();

  if (!recommended.length) {
    return [];
  }

  if (!text) {
    recommended.slice(0, 2).forEach((item) => requested.add(item));
    return Array.from(requested);
  }

  if (text.includes('analis') || text.includes('diagnostic') || text.includes('verific')) {
    recommended
      .filter((item) => item.includes('analyze') || item.includes('review'))
      .forEach((item) => requested.add(item));
  }

  if (text.includes('cres') || text.includes('growth') || text.includes('lançamento') || text.includes('launch')) {
    recommended
      .filter((item) => item.includes('growth') || item.includes('launch'))
      .forEach((item) => requested.add(item));
  }

  if (text.includes('pol') || text.includes('workflow') || text.includes('extern')) {
    recommended
      .filter((item) => item.includes('external_workflow') || item.includes('severity'))
      .forEach((item) => requested.add(item));
  }

  if (text.includes('execut') || text.includes('rod') || text.includes('run') || text.includes('agir')) {
    recommended.slice(0, 3).forEach((item) => requested.add(item));
  }

  if (!requested.size) {
    recommended.slice(0, 2).forEach((item) => requested.add(item));
  }

  return Array.from(requested);
}

function buildMissionAnswer({ missionState, message = '' }) {
  const focus = missionState?.personalOperator?.currentPlan?.focus || 'general';
  const nextAction = missionState?.personalOperator?.nextAction?.action?.title
    || missionState?.personalOperator?.nextAction?.action?.type
    || missionState?.livingIntent?.activeIntent?.action
    || missionState?.controlCenter?.recommendedActions?.[0]
    || 'review_control_center';
  const activeIntent = missionState?.livingIntent?.activeIntent?.type || 'steady_presence';
  const growthMode = missionState?.growthGovernor?.lastAnalysis?.growthMode || null;
  const blockerCount = missionState?.growthGovernor?.lastAnalysis?.blockers?.length || 0;
  const requestedActions = missionState?.execution?.requestedActions || [];
  const executiveMemory = missionState?.executiveMemory || {};

  return {
    summary: `Megan alinhou foco, intenção viva, memória executiva e controle operacional para ${focus}.`,
    responseText: message
      ? `Entendi sua solicitação: "${message}". O próximo passo mais forte agora é ${nextAction}.`
      : `O próximo passo mais forte agora é ${nextAction}.`,
    nextBestAction: nextAction,
    activeIntent,
    growthMode,
    blockerCount,
    openTaskCount: executiveMemory?.openTaskCount || 0,
    topPriority: executiveMemory?.topPriority || null,
    executedActionCount: requestedActions.length
  };
}

function buildQueueLevel(action = {}) {
  if (action.ready) return 'urgent_important';
  if (String(action.mode || '').includes('execute')) return 'strategic';
  if (String(action.mode || '').includes('confirm')) return 'automatic';
  return 'later';
}


export function getDashboardOverview({ userId = 'anonymous' } = {}) {
  const controlCenter = getControlCenterOverviewData({ userId });
  const personalOperator = getPersonalOperatorOverview({ userId });
  const livingIntent = getLivingIntentOrchestratorOverview({ userId });
  const executiveMemory = buildExecutiveMemorySummary({ userId });
  const priorityQueue = listPriorityQueue({ userId });
  const missionScore = getMissionScore({ userId }).score;
  const deadlock = getDeadlockStatus({ userId, limit: 3 });
  const evolutionPulse = getEvolutionPulseOverview({ userId, limit: 3 });
  const growthGovernor = getPostLaunchSustainableGrowthGovernorOverview({ userId });

  const snapshot = {
    missionScore,
    systemHealth: controlCenter?.systemHealth || 'stable',
    deadlockStatus: deadlock?.status || 'unknown'
  };

  syncDashboardHeartbeat({ userId, snapshot });
  const activityFeed = getDashboardActivityFeed({ userId, limit: 10 });
  const decisionReplay = getDecisionLogHistory({ userId, limit: 8 });

  const nextAction = personalOperator?.nextAction?.action || {};
  const currentPlan = personalOperator?.currentPlan || {};
  const activeIntent = livingIntent?.activeIntent || {};
  const queueItems = Array.isArray(priorityQueue?.items) ? priorityQueue.items : [];

  return {
    ok: true,
    userId,
    version: '109.0.0',
    profile: 'v109-autonomous-command-center',
    missionScore,
    systemHealth: controlCenter?.systemHealth || 'stable',
    deadlockStatus: deadlock?.status || 'unknown',
    nextAction: {
      title: nextAction.title || nextAction.type || 'review_control_center',
      ready: Boolean(nextAction.ready),
      mode: nextAction.mode || 'analyze',
      estimatedMinutes: nextAction.estimatedMinutes || null
    },
    currentPlan: {
      focus: currentPlan.focus || 'general',
      objective: currentPlan.objective || 'Manter operação alinhada',
      blockers: Array.isArray(currentPlan.blockers) ? currentPlan.blockers : []
    },
    livingIntent: {
      type: activeIntent.type || 'steady_presence',
      action: activeIntent.action || 'keep_system_ready',
      lastSync: livingIntent?.lastSync || null,
      pendingCount: Array.isArray(livingIntent?.pendingIntents) ? livingIntent.pendingIntents.length : 0
    },
    executiveMemory: {
      openTaskCount: executiveMemory?.openTaskCount || 0,
      topPriority: executiveMemory?.topPriority || null,
      latestDecision: executiveMemory?.latestDecision || null
    },
    priorityQueue: {
      total: priorityQueue?.total || 0,
      urgentImportant: priorityQueue?.urgentImportant || 0,
      strategic: priorityQueue?.strategic || 0,
      automatic: priorityQueue?.automatic || 0,
      later: priorityQueue?.later || 0,
      topItems: queueItems.slice(0, 6)
    },
    commandCenter: {
      executableQueueCount: queueItems.filter((item) => ['queued', 'open', 'ready', 'in_progress'].includes(String(item.status || ''))).length,
      doneCount: queueItems.filter((item) => String(item.status || '') === 'done').length,
      blockedCount: queueItems.filter((item) => String(item.status || '') === 'blocked').length,
      replayCount: decisionReplay?.total || 0,
      queue: queueItems.slice(0, 6)
    },
    decisionReplay: {
      total: decisionReplay?.total || 0,
      items: Array.isArray(decisionReplay?.decisions) ? decisionReplay.decisions : []
    },
    controlCenter: {
      profile: controlCenter?.profile || 'default',
      recommendedActions: Array.isArray(controlCenter?.recommendedActions)
        ? controlCenter.recommendedActions.slice(0, 5)
        : []
    },
    evolutionPulse: {
      totalPulses: evolutionPulse?.totalPulses || 0,
      lastPulseAt: evolutionPulse?.lastPulse?.generatedAt || null,
      lastDirection: evolutionPulse?.lastPulse?.direction || null
    },
    growthGovernor: {
      mode: growthGovernor?.lastAnalysis?.growthMode || null,
      score: growthGovernor?.lastAnalysis?.growthScore || null,
      blockerCount: growthGovernor?.lastAnalysis?.blockers?.length || 0,
      nextBestAction: growthGovernor?.lastAnalysis?.nextBestAction || null
    },
    activityFeed,
    autoRefresh: {
      enabled: true,
      recommendedIntervalSeconds: 15,
      lastHeartbeatAt: activityFeed?.lastHeartbeatAt || null
    },
    generatedAt: new Date().toISOString()
  };
}

export function runDashboardQuickAction({ userId = 'anonymous', action = 'refresh', message = '', meta = {} } = {}) {
  let actionResult = null;
  const currentOverview = getDashboardOverview({ userId });
  const normalizedMeta = meta && typeof meta === 'object' ? meta : {};

  switch (String(action || 'refresh')) {
    case 'control_cycle':
      actionResult = runControlCenterCycleData({ userId });
      break;
    case 'evolution_cycle':
      actionResult = runEvolutionPulse({ userId, trigger: 'dashboard_manual', message });
      break;
    case 'plan_day':
      actionResult = runPlanDay({ userId, message: message || 'Organizar o dia operacional da Megan OS' });
      break;
    case 'next_action':
      actionResult = runNextAction({ userId, message: message || 'Selecionar a próxima ação operacional' });
      break;
    case 'queue_recommended_actions': {
      const actions = Array.isArray(currentOverview?.controlCenter?.recommendedActions)
        ? currentOverview.controlCenter.recommendedActions.slice(0, 4)
        : [];
      const queued = actions.map((item) => addPriorityQueueItem({
        userId,
        title: item,
        action: item,
        type: 'dashboard_recommendation',
        level: 'strategic',
        status: 'ready',
        source: 'dashboard_command_center',
        reason: 'Ação recomendada pelo centro de controle da Megan.'
      }).item);
      actionResult = {
        queuedCount: queued.length,
        queuedItems: queued,
        summary: queued.length ? 'Ações recomendadas adicionadas na fila executável.' : 'Sem ações recomendadas disponíveis para enfileirar.'
      };
      break;
    }
    case 'queue_selected_action': {
      const actionName = normalizeMessage(normalizedMeta.actionName || normalizedMeta.title || message, 'manual_dashboard_action');
      const queued = addPriorityQueueItem({
        userId,
        title: actionName,
        action: actionName,
        type: 'manual_dashboard_action',
        level: normalizedMeta.level || 'strategic',
        status: 'ready',
        source: 'dashboard_manual_queue',
        reason: 'Ação enviada manualmente pelo operador no dashboard.'
      });
      actionResult = {
        queuedCount: queued?.item ? 1 : 0,
        queuedItem: queued.item,
        summary: queued?.item ? `Ação ${actionName} adicionada à fila.` : 'Não foi possível adicionar a ação à fila.'
      };
      break;
    }
    case 'execute_top_queue': {
      const nextQueue = getNextPriorityQueueItem({ userId });
      if (!nextQueue?.nextItem) {
        actionResult = { executed: false, summary: 'Não há itens executáveis na fila no momento.' };
        break;
      }
      updatePriorityQueueItem({ userId, id: nextQueue.nextItem.id, status: 'in_progress', note: 'Execução iniciada pelo command center.' });
      const completed = updatePriorityQueueItem({ userId, id: nextQueue.nextItem.id, status: 'done', note: 'Execução concluída pelo command center.' });
      const decision = addDecisionLog({
        userId,
        title: `Executar ${nextQueue.nextItem.title}`,
        reason: normalizedMeta.reason || nextQueue.nextItem.note || 'Item priorizado como próxima ação executável.',
        impact: 'operational_execution',
        reversible: true,
        source: 'dashboard_command_center'
      });
      actionResult = {
        executed: true,
        queueItem: completed.item,
        decision: decision.decision,
        summary: `Fila executada: ${nextQueue.nextItem.title}.`
      };
      break;
    }
    case 'confirm_next_action': {
      const nextActionTitle = normalizeMessage(currentOverview?.nextAction?.title, 'review_control_center');
      const queued = addPriorityQueueItem({
        userId,
        title: nextActionTitle,
        action: nextActionTitle,
        type: 'confirmed_next_action',
        level: buildQueueLevel(currentOverview?.nextAction || {}),
        status: 'ready',
        source: 'dashboard_confirmed_next_action',
        reason: 'Próxima ação confirmada pelo operador no painel.'
      });
      const decision = addDecisionLog({
        userId,
        title: `Confirmar ${nextActionTitle}`,
        reason: 'A próxima ação foi explicitamente confirmada no command center.',
        impact: 'alignment',
        reversible: true,
        source: 'dashboard_command_center'
      });
      actionResult = {
        confirmed: true,
        queuedItem: queued.item,
        decision: decision.decision,
        summary: `Próxima ação confirmada e movida para a fila: ${nextActionTitle}.`
      };
      break;
    }
    case 'refresh':
    default:
      actionResult = { refreshed: true };
      break;
  }

  const actionLabelMap = {
    refresh: 'Refresh operacional',
    control_cycle: 'Ciclo de controle executado',
    evolution_cycle: 'Ciclo de evolução executado',
    plan_day: 'Planejamento diário executado',
    next_action: 'Próxima ação selecionada',
    queue_recommended_actions: 'Ações recomendadas enfileiradas',
    queue_selected_action: 'Ação manual enfileirada',
    execute_top_queue: 'Fila executada',
    confirm_next_action: 'Próxima ação confirmada'
  };

  const actionSummary =
    normalizeMessage(actionResult?.message) ||
    normalizeMessage(actionResult?.summary) ||
    normalizeMessage(actionResult?.reason) ||
    (action === 'refresh' ? 'Overview sincronizado manualmente.' : 'Ação operacional concluída com sucesso.');

  const feedEvent = recordDashboardActivity({
    userId,
    type: 'action',
    status: action === 'refresh' ? 'info' : 'success',
    title: actionLabelMap[String(action || 'refresh')] || `Ação ${String(action || 'refresh')}`,
    summary: actionSummary,
    source: 'dashboard_action',
    meta: {
      action,
      inputMessage: normalizeMessage(message),
      resultKeys: actionResult && typeof actionResult === 'object' ? Object.keys(actionResult).slice(0, 8) : []
    }
  });

  return {
    ok: true,
    action,
    actionResult,
    feedEvent: feedEvent.event,
    dashboard: getDashboardOverview({ userId })
  };
}

export function getAiStatus({ userId = 'anonymous' } = {}) {
  const policy = getExternalWorkflowPolicyOverview({ userId });
  const growthGovernor = getPostLaunchSustainableGrowthGovernorOverview({ userId });
  const personalOperator = getPersonalOperatorOverview({ userId });
  const livingIntent = getLivingIntentOrchestratorOverview({ userId });
  const controlCenter = getControlCenterOverviewData({ userId });
  const executiveMemory = buildExecutiveMemorySummary({ userId });
  const priorityQueue = listPriorityQueue({ userId });
  const decisionLog = getDecisionLogHistory({ userId, limit: 5 });
  const missionScore = getMissionScore({ userId }).score;
  const deadlockStatus = getDeadlockStatus({ userId, limit: 3 }).status;
  const evolutionPulse = getEvolutionPulseOverview({ userId, limit: 3 });
  const metaCognition = getMetaCognitionOverview({ userId, limit: 3 }).current;
  const preflightSimulation = getPreflightSimulationOverview({ userId, limit: 3 });
  const routeOutcomeMemory = getRouteOutcomeMemoryOverview({ userId, limit: 3 });
  const adaptiveRouteLearning = getAdaptiveRouteLearningOverview({ userId, limit: 3 }).current;
  const contextEffectivenessMemory = getContextEffectivenessMemoryOverview({ userId, limit: 3 });
  const performanceDropForecast = getPerformanceDropOverview({ userId, limit: 3 }).current;
  const sequencePatternMemory = getSequencePatternMemoryOverview({ userId, limit: 3 }).current;
  const actionChain = getActionChainOverview({ userId, limit: 3 }).current;
  const dependencyGraph = getDependencyGraphOverview({ userId, limit: 3 }).current;
  const bottleneckForecast = getBottleneckForecastOverview({ userId, limit: 3 }).current;
  const flowOutcomeMemory = getFlowOutcomeMemoryOverview({ userId, limit: 3 });
  const winningFlowSelector = getWinningFlowSelectorOverview({ userId, limit: 3 }).current;
  const operationBenchmarkMemory = getOperationBenchmarkMemoryOverview({ userId, limit: 3 }).current;
  const championFlowReuse = getChampionFlowReuseOverview({ userId, limit: 3 }).current;
  const operationalTemplateMemory = getOperationalTemplateMemoryOverview({ userId, limit: 3 }).current;
  const operationTemplateAssembler = getOperationTemplateAssemblerOverview({ userId, limit: 3 }).current;
  const templateExecutionMemory = getTemplateExecutionMemoryOverview({ userId, limit: 3 });
  const templateAutotune = getTemplateAutotuneOverview({ userId, limit: 3 }).current;
  const modularTemplateMemory = getModularTemplateMemoryOverview({ userId, limit: 3 }).current;
  const hybridTemplateComposer = getHybridTemplateComposerOverview({ userId, limit: 3 }).current;
  const modulePerformanceMemory = getModulePerformanceMemoryOverview({ userId, limit: 3 }).current;
  const moduleAutorebuild = getModuleAutorebuildOverview({ userId, limit: 3 }).current;
  const moduleFunctionBenchmark = getModuleFunctionBenchmarkOverview({ userId, limit: 3 }).current;
  const modulePieceSelector = getModulePieceSelectorOverview({ userId, limit: 3 }).current;

  return {
    ok: true,
    userId,
    version: '106.0.0',
    activeProfile: 'v106-module-benchmark-selector',
    externalWorkflowPolicyStatus: {
      policyReady: policy.policyReady,
      lastAnalysisAt: policy.lastAnalysis?.analyzedAt || null,
      lastAppliedAt: policy.lastApplied?.appliedAt || null,
      activePolicyCount: policy.activePolicies.length,
      topPolicy: policy.lastAnalysis?.topPolicy || null,
      highSeverityCount: policy.activePolicies.filter((item) => item.severity === 'high').length
    },
    postLaunchSustainableGrowthGovernorStatus: {
      governorReady: growthGovernor.growthGovernorReady,
      lastSyncAt: growthGovernor.lastSync || null,
      lastApprovedAt: growthGovernor.lastApproved?.approvedAt || null,
      growthMode: growthGovernor.lastAnalysis?.growthMode || null,
      growthScore: growthGovernor.lastAnalysis?.growthScore || null,
      blockerCount: growthGovernor.lastAnalysis?.blockers?.length || 0,
      nextBestAction: growthGovernor.lastAnalysis?.nextBestAction || null
    },
    personalOperatorStatus: getPersonalOperatorStatusBlock({ userId }),
    livingIntentStatus: {
      enabled: true,
      orchestrationMode: livingIntent.orchestrationMode,
      activeIntentType: livingIntent.activeIntent?.type || null,
      pendingIntentCount: livingIntent.pendingIntents?.length || 0,
      lastSync: livingIntent.lastSync || null,
      lastCommit: livingIntent.lastCommit?.committedAt || null
    },
    controlCenterStatus: {
      profile: controlCenter.profile,
      recommendedActions: controlCenter.recommendedActions,
      recommendedActionCount: controlCenter.recommendedActions.length
    },
    executiveMemoryStatus: executiveMemory,
    priorityQueueStatus: {
      total: priorityQueue.total,
      urgentImportant: priorityQueue.urgentImportant,
      strategic: priorityQueue.strategic,
      automatic: priorityQueue.automatic,
      later: priorityQueue.later
    },
    decisionLogStatus: {
      total: decisionLog.total,
      latestDecision: decisionLog.decisions?.[0] || null
    },
    missionScoreStatus: missionScore,
    deadlockStatus,
    evolutionPulseStatus: {
      totalPulses: evolutionPulse.totalPulses,
      lastPulse: evolutionPulse.lastPulse || null
    },
    executionRuntimeStatus: getExecutionRuntimeOverview({ userId }).resume,
    routeOutcomeMemoryStatus: routeOutcomeMemory.summary,
    adaptiveRouteLearningStatus: {
      totalLearnedRoutes: adaptiveRouteLearning?.totalLearnedRoutes || 0,
      topPositiveRoute: adaptiveRouteLearning?.topPositiveRoutes?.[0] || null,
      topNegativeRoute: adaptiveRouteLearning?.topNegativeRoutes?.[0] || null
    },
    contextEffectivenessStatus: {
      bestContext: contextEffectivenessMemory?.bestContexts?.[0] || null,
      worstContext: contextEffectivenessMemory?.worstContexts?.[0] || null,
      current: contextEffectivenessMemory?.current || null
    },
    performanceDropForecastStatus: performanceDropForecast?.forecast || null,
    sequencePatternStatus: {
      missionName: sequencePatternMemory?.currentSequence?.missionName || null,
      fingerprint: sequencePatternMemory?.currentSequence?.fingerprint || null,
      expectedWasteReduction: sequencePatternMemory?.recommendation?.expectedWasteReduction || 0
    },
    actionChainStatus: {
      sequencingMode: actionChain?.sequencingMode || null,
      suggestedNextChainStep: actionChain?.suggestedNextChainStep || null,
      expectedWasteReduction: actionChain?.expectedWasteReduction || 0
    },
    dependencyGraphStatus: {
      dependencyRisk: dependencyGraph?.dependencyRisk || 0,
      bottleneckCandidate: dependencyGraph?.bottleneckCandidates?.[0] || null,
      recommendedOrderCount: dependencyGraph?.recommendedOrder?.length || 0
    },
    bottleneckForecastStatus: bottleneckForecast?.forecast || null,
    flowOutcomeMemoryStatus: flowOutcomeMemory?.summary || null,
    winningFlowSelectorStatus: {
      selectedFlow: winningFlowSelector?.selectedFlow || null,
      fallbackFlow: winningFlowSelector?.supportSignals?.fallbackFlow || null,
      bestWinnerScore: winningFlowSelector?.supportSignals?.bestWinnerScore || 0
    },
    operationBenchmarkStatus: {
      missionName: operationBenchmarkMemory?.missionName || null,
      bestChampion: operationBenchmarkMemory?.supportSignals?.bestChampion || null,
      reusableFlowCount: operationBenchmarkMemory?.supportSignals?.reusableFlowCount || 0
    },
    championFlowReuseStatus: {
      shouldReuseChampion: championFlowReuse?.shouldReuseChampion || false,
      selectedFlow: championFlowReuse?.selectedFlow || null,
      benchmarkChampion: championFlowReuse?.benchmarkChampion || null
    },
    operationalTemplateStatus: {
      templateSource: operationalTemplateMemory?.templateSource || null,
      templateReadiness: operationalTemplateMemory?.templateReadiness || 0,
      missingSlots: operationalTemplateMemory?.missingSlots?.length || 0
    },
    operationTemplateAssemblerStatus: {
      assemblyConfidence: operationTemplateAssembler?.assemblyConfidence || 0,
      gapCoverage: operationTemplateAssembler?.gapCoverage || 0,
      firstAction: operationTemplateAssembler?.assembledOperation?.firstAction || null
    },
    templateExecutionMemoryStatus: templateExecutionMemory?.summary || null,
    templateAutotuneStatus: {
      mode: templateAutotune?.autotune?.mode || 'baseline',
      retuneScore: templateAutotune?.autotune?.retuneScore || 0,
      recommendedInsertions: templateAutotune?.autotune?.recommendedInsertions?.length || 0
    },
    modularTemplateStatus: {
      compositionScore: modularTemplateMemory?.compositionScore || 0,
      coreModules: modularTemplateMemory?.coreModules?.length || 0,
      upgradeModules: modularTemplateMemory?.upgradeModules?.length || 0
    },
    hybridTemplateStatus: {
      hybridConfidence: hybridTemplateComposer?.hybridConfidence || 0,
      replacedModules: hybridTemplateComposer?.replacedModules || 0,
      firstAction: hybridTemplateComposer?.hybridOperation?.firstAction || null
    },
    modulePerformanceStatus: {
      championModules: modulePerformanceMemory?.championModules?.length || 0,
      weakModules: modulePerformanceMemory?.weakModules?.length || 0,
      topChampion: modulePerformanceMemory?.championModules?.[0] || null,
      topWeak: modulePerformanceMemory?.weakModules?.[0] || null
    },
    moduleAutorebuildStatus: {
      autoRebuildScore: moduleAutorebuild?.autoRebuildScore || 0,
      removedModules: moduleAutorebuild?.removedModules?.length || 0,
      insertedModules: moduleAutorebuild?.insertedModules?.length || 0,
      firstAction: moduleAutorebuild?.rebuiltHybridTemplate?.firstAction || null
    }
  };
}

export function getExternalWorkflowPolicyOverviewData(payload = {}) {
  return getExternalWorkflowPolicyOverview(payload);
}

export function runExternalWorkflowPolicyAnalyzeData(payload = {}) {
  return analyzeExternalWorkflowPolicy(payload);
}

export function runExternalWorkflowPolicyApplyData(payload = {}) {
  return applyExternalWorkflowPolicy(payload);
}

export function getPostLaunchSustainableGrowthGovernorOverviewData(payload = {}) {
  return getPostLaunchSustainableGrowthGovernorOverview(payload);
}

export function runPostLaunchSustainableGrowthGovernorSyncData(payload = {}) {
  return syncPostLaunchSustainableGrowthGovernor(payload);
}

export function runPostLaunchSustainableGrowthGovernorApproveData(payload = {}) {
  return approvePostLaunchSustainableGrowthGovernor(payload);
}

export function getPersonalOperatorOverviewData(payload = {}) {
  return getPersonalOperatorOverview(payload);
}

export function runPersonalOperatorPlanDayData(payload = {}) {
  return runPlanDay(payload);
}

export function runPersonalOperatorNextActionData(payload = {}) {
  return runNextAction(payload);
}

export function getLivingIntentOverviewData(payload = {}) {
  return getLivingIntentOrchestratorOverview(payload);
}

export function runLivingIntentSyncData(payload = {}) {
  return syncLivingIntentOrchestrator(payload);
}

export function runLivingIntentCommitData(payload = {}) {
  return runLivingIntentCommit(payload);
}

export function getExecutiveMemoryStateData(payload = {}) {
  return getExecutiveMemoryState(payload);
}

export function saveExecutiveMemoryData(payload = {}) {
  return saveExecutiveMemory(payload);
}

export function addPriorityQueueItemData(payload = {}) {
  return addPriorityQueueItem(payload);
}

export function listPriorityQueueData(payload = {}) {
  return listPriorityQueue(payload);
}

export function addDecisionLogData(payload = {}) {
  return addDecisionLog(payload);
}

export function getDecisionLogHistoryData(payload = {}) {
  return getDecisionLogHistory(payload);
}


export function getExecutionRuntimeOverviewData(payload = {}) {
  return getExecutionRuntimeOverview(payload);
}

export function getMissionScoreData(payload = {}) {
  return getMissionScore(payload);
}

export function runMissionScoreRecalculateData(payload = {}) {
  return recalculateMissionScore(payload);
}

export function getDeadlockStatusData(payload = {}) {
  return getDeadlockStatus(payload);
}

export function runDeadlockRecoveryData(payload = {}) {
  return recoverDeadlock(payload);
}

export function getEvolutionPulseOverviewData(payload = {}) {
  return getEvolutionPulseOverview(payload);
}

export function runEvolutionPulseData(payload = {}) {
  return runEvolutionPulse(payload);
}

export function getMetaCognitionOverviewData(payload = {}) {
  return getMetaCognitionOverview(payload);
}

export function runMetaCognitionEvaluateData(payload = {}) {
  return evaluateMetaCognition(payload);
}

export function getPreflightSimulationOverviewData(payload = {}) {
  return getPreflightSimulationOverview(payload);
}

export function runPreflightSimulationData(payload = {}) {
  return runPreflightSimulation(payload);
}

export function runPreventiveRouteSelectionData(payload = {}) {
  return selectPreventiveRoute(payload);
}

export function getRouteOutcomeMemoryOverviewData(payload = {}) {
  return getRouteOutcomeMemoryOverview(payload);
}

export function runRouteOutcomeRecordData(payload = {}) {
  return recordRouteOutcome(payload);
}

export function getAdaptiveRouteLearningOverviewData(payload = {}) {
  return getAdaptiveRouteLearningOverview(payload);
}

export function runAdaptiveRouteLearningRetuneData(payload = {}) {
  return retuneAdaptiveRouteLearning(payload);
}

export function getMissionPatternMemoryOverviewData(payload = {}) {
  return getMissionPatternMemoryOverview(payload);
}

export function runMissionPatternMemorySyncData(payload = {}) {
  return syncMissionPatternMemory(payload);
}

export function getContextStrategyOverviewData(payload = {}) {
  return getContextStrategyOverview(payload);
}

export function runContextStrategyEvaluateData(payload = {}) {
  return evaluateContextStrategy(payload);
}

export function getContextEffectivenessMemoryOverviewData(payload = {}) {
  return getContextEffectivenessMemoryOverview(payload);
}

export function runContextEffectivenessRecordData(payload = {}) {
  return recordContextEffectiveness(payload);
}

export function getPerformanceDropOverviewData(payload = {}) {
  return getPerformanceDropOverview(payload);
}

export function runPerformanceDropEvaluateData(payload = {}) {
  return evaluatePerformanceDrop(payload);
}

export function getSequencePatternMemoryOverviewData(payload = {}) {
  return getSequencePatternMemoryOverview(payload);
}

export function runSequencePatternMemorySyncData(payload = {}) {
  return syncSequencePatternMemory(payload);
}

export function getActionChainOverviewData(payload = {}) {
  return getActionChainOverview(payload);
}

export function runActionChainEvaluateData(payload = {}) {
  return evaluateActionChain(payload);
}

export function runActionChainAdaptData(payload = {}) {
  return adaptActionOrder(payload);
}

export function runExecutionResumeData(payload = {}) {
  return resumeMissionExecution(payload);
}

export function runExecutionPulseData(payload = {}) {
  return runExecutionPulse(payload);
}

export function runExecutionCompleteData(payload = {}) {
  return completeMissionExecution(payload);
}

export function runExecutionBlockerData(payload = {}) {
  return reportExecutionBlocker(payload);
}

export function getFlowOutcomeMemoryOverviewData(payload = {}) {
  return getFlowOutcomeMemoryOverview(payload);
}

export function runFlowOutcomeRecordData(payload = {}) {
  return recordFlowOutcome(payload);
}

export function getWinningFlowSelectorOverviewData(payload = {}) {
  return getWinningFlowSelectorOverview(payload);
}

export function runWinningFlowSelectorEvaluateData(payload = {}) {
  return evaluateWinningFlowSelector(payload);
}

export function getOperationBenchmarkMemoryOverviewData(payload = {}) {
  return getOperationBenchmarkMemoryOverview(payload);
}

export function runOperationBenchmarkMemorySyncData(payload = {}) {
  return syncOperationBenchmarkMemory(payload);
}

export function getChampionFlowReuseOverviewData(payload = {}) {
  return getChampionFlowReuseOverview(payload);
}

export function runChampionFlowReuseEvaluateData(payload = {}) {
  return evaluateChampionFlowReuse(payload);
}



export function getModulePerformanceMemoryOverviewData(payload = {}) {
  return getModulePerformanceMemoryOverview(payload);
}

export function runModulePerformanceMemorySyncData(payload = {}) {
  return syncModulePerformanceMemory(payload);
}

export function getModuleAutorebuildOverviewData(payload = {}) {
  return getModuleAutorebuildOverview(payload);
}

export function runModuleAutorebuildEvaluateData(payload = {}) {
  return evaluateModuleAutorebuild(payload);
}

export function getMissionHubOverviewData({ userId = 'anonymous' } = {}) {
  const controlCenter = getControlCenterOverviewData({ userId });
  const personalOperator = getPersonalOperatorOverview({ userId });
  const livingIntent = getLivingIntentOrchestratorOverview({ userId });
  const policy = getExternalWorkflowPolicyOverview({ userId });
  const growthGovernor = getPostLaunchSustainableGrowthGovernorOverview({ userId });
  const executiveMemory = buildExecutiveMemorySummary({ userId });
  const priorityQueue = listPriorityQueue({ userId });
  const decisionHistory = getDecisionLogHistory({ userId, limit: 10 });
  const executionRuntime = getExecutionRuntimeOverview({ userId });
  const missionScore = getMissionScore({ userId });
  const deadlock = getDeadlockStatus({ userId, limit: 5 });
  const evolutionPulse = getEvolutionPulseOverview({ userId, limit: 5 });
  const metaCognition = getMetaCognitionOverview({ userId, limit: 5 });
  const preflightSimulation = getPreflightSimulationOverview({ userId, limit: 5 });
  const routeOutcomeMemory = getRouteOutcomeMemoryOverview({ userId, limit: 10 });
  const adaptiveRouteLearning = getAdaptiveRouteLearningOverview({ userId, limit: 5 });
  const missionPatternMemory = getMissionPatternMemoryOverview({ userId, limit: 5 });
  const contextStrategy = getContextStrategyOverview({ userId, limit: 5 });
  const contextEffectivenessMemory = getContextEffectivenessMemoryOverview({ userId, limit: 5 });
  const performanceDropForecast = getPerformanceDropOverview({ userId, limit: 5 });
  const sequencePatternMemory = getSequencePatternMemoryOverview({ userId, limit: 5 });
  const actionChain = getActionChainOverview({ userId, limit: 5 });
  const dependencyGraph = getDependencyGraphOverview({ userId, limit: 5 });
  const bottleneckForecast = getBottleneckForecastOverview({ userId, limit: 5 });
  const flowOutcomeMemory = getFlowOutcomeMemoryOverview({ userId, limit: 5 });
  const winningFlowSelector = getWinningFlowSelectorOverview({ userId, limit: 5 });
  const operationBenchmarkMemory = getOperationBenchmarkMemoryOverview({ userId, limit: 5 });
  const championFlowReuse = getChampionFlowReuseOverview({ userId, limit: 5 });
  const operationalTemplateMemory = getOperationalTemplateMemoryOverview({ userId, limit: 5 });
  const operationTemplateAssembler = getOperationTemplateAssemblerOverview({ userId, limit: 5 });
  const modularTemplateMemory = getModularTemplateMemoryOverview({ userId, limit: 5 });
  const hybridTemplateComposer = getHybridTemplateComposerOverview({ userId, limit: 5 });

  return {
    userId,
    profile: 'v106-module-benchmark-selector',
    controlCenter,
    personalOperator,
    livingIntent,
    externalWorkflowPolicy: policy,
    growthGovernor,
    executiveMemory,
    priorityQueue,
    decisionHistory,
    executionRuntime,
    missionScore,
    deadlock,
    evolutionPulse,
    metaCognition,
    preflightSimulation,
    routeOutcomeMemory,
    adaptiveRouteLearning,
    missionPatternMemory,
    contextStrategy,
    contextEffectivenessMemory,
    performanceDropForecast,
    sequencePatternMemory,
    actionChain,
    dependencyGraph,
    bottleneckForecast,
    flowOutcomeMemory,
    winningFlowSelector,
    operationBenchmarkMemory,
    championFlowReuse,
    operationalTemplateMemory,
    operationTemplateAssembler,
    modularTemplateMemory,
    hybridTemplateComposer,
    nextBestAction:
      personalOperator?.nextAction?.action?.title
      || personalOperator?.nextAction?.action?.type
      || livingIntent?.activeIntent?.action
      || controlCenter?.recommendedActions?.[0]
      || executiveMemory?.nextStep
      || null
  };
}

export function runMissionHubProcessData(payload = {}) {
  const userId = String(payload.userId || 'anonymous');
  const message = normalizeMessage(payload.message);
  const dayFocus = payload.dayFocus || payload.focus || message || 'general';

  const planning = runPlanDay({ ...payload, userId, dayFocus });
  const nextAction = runNextAction({ ...payload, userId, dayFocus });
  const livingIntent = syncLivingIntentOrchestrator({ userId });
  const controlCenter = getControlCenterOverviewData({ userId });
  const requestedActions = buildRequestedActions({ message, controlOverview: controlCenter });
  const controlRun = requestedActions.length
    ? runControlCenterCycleData({ userId, actions: requestedActions })
    : runControlCenterCycleData({ userId, actions: [] });

  const queueItem = nextAction?.nextAction?.action
    ? addPriorityQueueItem({
      userId,
      title: nextAction.nextAction.action.title || nextAction.nextAction.action.type,
      type: nextAction.nextAction.action.type || 'mission_action',
      level: buildQueueLevel(nextAction.nextAction.action),
      source: 'mission_hub',
      status: 'queued',
      weight: nextAction.nextAction.action.ready ? 100 : 80
    })
    : null;

  const decision = addDecisionLog({
    userId,
    title: nextAction?.nextAction?.action?.title || nextAction?.nextAction?.action?.type || 'review_control_center',
    reason: nextAction?.nextAction?.rationale || 'selected_from_mission_hub',
    impact: 'operational',
    source: 'mission_hub',
    reversible: true
  });

  const missionPreview = getMissionHubOverviewData({ userId });

  const executiveMemory = saveExecutiveMemory({
    userId,
    message,
    responseText: null,
    dayFocus,
    lastPlan: planning,
    lastNextAction: nextAction.nextAction,
    lastIntent: livingIntent,
    lastControlCenter: controlCenter,
    lastMissionHub: {
      input: { message, dayFocus, context: payload.context || {} },
      mission: missionPreview
    },
    decisions: [decision.decision]
  });

  const executionPulse = runExecutionPulse({ userId, note: 'mission_hub_pulse' });
  const missionScore = recalculateMissionScore({ userId, source: 'mission_hub_process', note: message || dayFocus });
  const metaCognition = evaluateMetaCognition({ userId, message, requestedActions }).assessment;
  const preflightSimulation = runPreflightSimulation({ userId, message, routes: metaCognition?.candidateRoutes || [] }).simulation;
  const preventiveRoute = selectPreventiveRoute({ userId }).selected;
  const routeOutcome = preventiveRoute
    ? recordRouteOutcome({
      userId,
      missionName: dayFocus,
      routeTitle: preventiveRoute.title,
      routeType: preventiveRoute.type,
      routeSource: preventiveRoute.source,
      outcome: 'planned',
      predictedScore: preventiveRoute.score,
      riskAtSelection: preventiveRoute.risk,
      note: 'preventive_route_selected'
    })
    : null;
  const adaptiveRouteLearning = retuneAdaptiveRouteLearning({ userId }).learning;
  const missionPatternMemory = syncMissionPatternMemory({ userId, message, dayFocus }).patterns;
  const contextStrategy = evaluateContextStrategy({ userId, message, dayFocus }).strategy;
  const contextEffectivenessMemory = syncContextEffectivenessSnapshot({ userId, message, dayFocus });
  const performanceDropForecast = evaluatePerformanceDrop({ userId }).forecast;
  const sequencePatternMemory = syncSequencePatternMemory({ userId, message, dayFocus }).sequenceMemory;
  const actionChain = evaluateActionChain({ userId, message, dayFocus }).actionChain;
  const adaptedActionOrder = adaptActionOrder({ userId, message, dayFocus });
  const dependencyGraph = syncDependencyGraphMemory({ userId, message, dayFocus }).dependencyGraph;
  const bottleneckForecast = evaluateBottleneckForecast({ userId, message, dayFocus }).bottleneckForecast;
  const winningFlowSelector = evaluateWinningFlowSelector({ userId, message, dayFocus }).winningFlowSelector;
  const operationBenchmark = syncOperationBenchmarkMemory({ userId, message, dayFocus, selectedFlow: winningFlowSelector?.selectedFlow }).benchmark;
  const championFlowReuse = evaluateChampionFlowReuse({ userId, message, dayFocus, selectedFlow: winningFlowSelector?.selectedFlow }).championFlowReuse;
  const operationalTemplateMemory = syncOperationalTemplateMemory({ userId, message, dayFocus, selectedFlow: championFlowReuse?.selectedFlow || winningFlowSelector?.selectedFlow }).template;
  const operationTemplateAssembler = evaluateOperationTemplateAssembler({ userId, message, dayFocus }).operationTemplate;
  const templateExecutionMemory = recordTemplateExecution({
    userId,
    missionName: dayFocus,
    missionType: operationalTemplateMemory?.missionType,
    templateFingerprint: operationalTemplateMemory?.templateFingerprint || operationTemplateAssembler?.templateFingerprint,
    templateSource: operationalTemplateMemory?.templateSource,
    baseFlowName: operationalTemplateMemory?.baseFlowName || operationTemplateAssembler?.baseFlowName,
    strategyMode: operationalTemplateMemory?.strategyMode || operationTemplateAssembler?.strategyMode,
    templateReadiness: operationalTemplateMemory?.templateReadiness,
    assemblyConfidence: operationTemplateAssembler?.assemblyConfidence,
    gapCoverage: operationTemplateAssembler?.gapCoverage,
    insertedGapFillers: operationTemplateAssembler?.insertedGapFillers,
    assembledOperation: operationTemplateAssembler?.assembledOperation,
    outcome: 'planned',
    note: 'template_selected_for_execution'
  });
  const templateAutotune = evaluateTemplateAutotune({ userId, message, dayFocus }).templateAutotune;
  const modularTemplateMemory = syncModularTemplateMemory({ userId, message, dayFocus }).modularTemplate;
  const hybridTemplateComposer = evaluateHybridTemplateComposer({ userId, message, dayFocus }).hybridTemplate;
  const modulePerformanceMemory = syncModulePerformanceMemory({ userId, message, dayFocus }).modulePerformance;
  const moduleAutorebuild = evaluateModuleAutorebuild({ userId, message, dayFocus }).moduleAutorebuild;
  const moduleFunctionBenchmark = syncModuleFunctionBenchmark({ userId, message, dayFocus }).benchmark;
  const modulePieceSelector = evaluateModulePieceSelector({ userId, message, dayFocus }).modulePieceSelector;
  const selectedFlow = championFlowReuse?.selectedFlow || winningFlowSelector?.selectedFlow || null;
  const flowOutcome = selectedFlow
    ? recordFlowOutcome({
      userId,
      missionName: dayFocus,
      flowName: selectedFlow.flowName,
      strategyMode: selectedFlow.strategyMode,
      routeTitle: selectedFlow.routeTitle,
      routeType: selectedFlow.routeType,
      orderedSteps: selectedFlow.orderedSteps,
      bottleneckRisk: selectedFlow.bottleneckRisk,
      dependencyRisk: selectedFlow.dependencyRisk,
      executionWindowScore: selectedFlow.executionWindowScore,
      predictedSuccess: selectedFlow.predictedSuccess,
      outcome: 'planned',
      flowScore: selectedFlow.winnerScore,
      wasteLevel: selectedFlow.expectedWasteLevel,
      note: 'winning_flow_selected'
    })
    : null;
  const dependencyAwareActionOrder = {
    userId,
    adapted: true,
    orderedSteps: bottleneckForecast?.recommendedReorder || adaptedActionOrder?.orderedSteps || [],
    primaryBottleneck: bottleneckForecast?.forecast?.primaryBottleneck || null,
    mitigationPriority: bottleneckForecast?.forecast?.mitigationPriority || 'keep_current_order'
  };
  const deadlockStatus = getDeadlockStatus({ userId, limit: 5 }).status;
  const autoRecovery = deadlockStatus.detected
    ? recoverDeadlock({ userId, fallbackTitle: nextAction?.nextAction?.action?.title || dayFocus })
    : null;
  const evolutionPulse = runEvolutionPulse({ userId, source: 'mission_hub_process' });
  const missionState = getMissionHubOverviewData({ userId });
  const answer = buildMissionAnswer({
    missionState: {
      ...missionState,
      execution: {
        requestedActions,
        planning,
        nextAction,
        controlRun,
        queueItem,
        decision,
        executionPulse,
        missionScore,
        deadlockStatus,
        autoRecovery,
        evolutionPulse,
        metaCognition,
        preflightSimulation,
        preventiveRoute,
        routeOutcome,
        adaptiveRouteLearning,
        missionPatternMemory,
        contextStrategy,
        contextEffectivenessMemory,
        performanceDropForecast,
        sequencePatternMemory,
        actionChain,
        adaptedActionOrder,
        dependencyGraph,
        bottleneckForecast,
        dependencyAwareActionOrder,
        winningFlowSelector,
        operationBenchmark,
        championFlowReuse,
        operationalTemplateMemory,
        operationTemplateAssembler,
        templateExecutionMemory,
        templateAutotune,
        modularTemplateMemory,
        hybridTemplateComposer,
        modulePerformanceMemory,
        moduleAutorebuild,
        moduleFunctionBenchmark,
        modulePieceSelector,
        flowOutcome
      }
    },
    message
  });

  saveExecutiveMemory({
    userId,
    message,
    responseText: answer.responseText,
    dayFocus,
    lastPlan: planning,
    lastNextAction: nextAction.nextAction,
    lastIntent: livingIntent,
    lastControlCenter: controlCenter,
    lastMissionHub: {
      input: { message, dayFocus, context: payload.context || {} },
      mission: missionState,
      answer
    },
    decisions: [decision.decision]
  });

  return {
    ok: true,
    userId,
    profile: 'v106-module-benchmark-selector',
    input: {
      message,
      dayFocus,
      context: payload.context || {}
    },
    execution: {
      planning,
      nextAction,
      livingIntent,
      requestedActions,
      controlRun,
      queueItem,
      decision,
      executiveMemory,
      executionPulse,
      missionScore,
      deadlockStatus,
      autoRecovery,
      evolutionPulse,
      metaCognition,
      preflightSimulation,
      preventiveRoute,
      routeOutcome,
      adaptiveRouteLearning,
      missionPatternMemory,
      contextStrategy,
      contextEffectivenessMemory,
      performanceDropForecast,
      sequencePatternMemory,
      actionChain,
      adaptedActionOrder,
      dependencyGraph,
      bottleneckForecast,
      dependencyAwareActionOrder,
      winningFlowSelector,
      operationBenchmark,
      championFlowReuse,
      operationalTemplateMemory,
      operationTemplateAssembler,
      templateExecutionMemory,
      templateAutotune,
      modularTemplateMemory,
      hybridTemplateComposer,
      modulePerformanceMemory,
      moduleAutorebuild,
      moduleFunctionBenchmark,
      modulePieceSelector,
      flowOutcome
    },
    mission: missionState,
    answer
  };
}


export function getDependencyGraphOverviewData(payload = {}) {
  return getDependencyGraphOverview(payload);
}

export function runDependencyGraphSyncData(payload = {}) {
  return syncDependencyGraphMemory(payload);
}

export function getBottleneckForecastOverviewData(payload = {}) {
  return getBottleneckForecastOverview(payload);
}

export function runBottleneckForecastEvaluateData(payload = {}) {
  return evaluateBottleneckForecast(payload);
}


export function getOperationalTemplateMemoryOverviewData(payload = {}) {
  return getOperationalTemplateMemoryOverview(payload);
}

export function runOperationalTemplateMemorySyncData(payload = {}) {
  return syncOperationalTemplateMemory(payload);
}

export function getOperationTemplateAssemblerOverviewData(payload = {}) {
  return getOperationTemplateAssemblerOverview(payload);
}

export function runOperationTemplateAssemblerEvaluateData(payload = {}) {
  return evaluateOperationTemplateAssembler(payload);
}

export {
  getControlCenterOverviewData,
  runControlCenterCycleData
};


export function getTemplateExecutionMemoryOverviewData(payload = {}) {
  return getTemplateExecutionMemoryOverview(payload);
}

export function runTemplateExecutionRecordData(payload = {}) {
  return recordTemplateExecution(payload);
}

export function getTemplateAutotuneOverviewData(payload = {}) {
  return getTemplateAutotuneOverview(payload);
}

export function runTemplateAutotuneEvaluateData(payload = {}) {
  return evaluateTemplateAutotune(payload);
}


export function getModularTemplateMemoryOverviewData(payload = {}) {
  return getModularTemplateMemoryOverview(payload);
}

export function runModularTemplateMemorySyncData(payload = {}) {
  return syncModularTemplateMemory(payload);
}

export function getHybridTemplateComposerOverviewData(payload = {}) {
  return getHybridTemplateComposerOverview(payload);
}

export function runHybridTemplateComposerEvaluateData(payload = {}) {
  return evaluateHybridTemplateComposer(payload);
}


export function getModuleFunctionBenchmarkOverviewData(payload = {}) {
  return getModuleFunctionBenchmarkOverview(payload);
}

export function runModuleFunctionBenchmarkSyncData(payload = {}) {
  return syncModuleFunctionBenchmark(payload);
}

export function getModulePieceSelectorOverviewData(payload = {}) {
  return getModulePieceSelectorOverview(payload);
}

export function runModulePieceSelectorEvaluateData(payload = {}) {
  return evaluateModulePieceSelector(payload);
}
