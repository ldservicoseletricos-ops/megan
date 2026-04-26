const { getCompanies: buildCompanies, addCompany } = require('./services/multi-company.service');
const { getUnits: buildUnits, addUnit } = require('./services/multi-unit.service');
const { buildCommandDashboard } = require('./services/central-command.service');
const { buildEnterpriseBenchmark } = require('./services/benchmark-engine.service');
const { buildEnterpriseLedger } = require('./services/enterprise-ledger.service');
const { buildVendorRanking } = require('./services/vendor-ranking.service');
const { evaluateVendor, buildCommercialDashboard } = require('./services/commercial-intelligence.service');
const { startExternalNegotiation } = require('./services/external-negotiation.service');
const { buildOpportunities } = require('./services/opportunity-expansion.service');
const { buildDealLedger } = require('./services/deal-ledger.service');
const { buildDefaultHumanGoals, addHumanGoal, summarizeHumanGoals } = require('./services/human-goals.service');
const { buildExecutiveToday, buildExecutivePlan } = require('./services/executive-assistant.service');
const { allocateFocus } = require('./services/focus-allocation.service');
const { appendExecutiveLedger, buildExecutiveLedger } = require('./services/executive-ledger.service');
const { buildPriorityCalendar } = require('./services/priority-calendar.service');
const { buildTeamStatus, addTeamMember } = require('./services/team-coordination.service');
const { buildDefaultTasks, distributeTasks } = require('./services/task-distribution.service');
const { buildTeamPerformance, buildWorkload } = require('./services/team-performance.service');
const { appendWorkforceLedger, buildWorkforceLedger } = require('./services/workforce-ledger.service');
const { buildTeamPriority } = require('./services/team-priority.service');
const { listLeads, addLead } = require('./services/smart-crm.service');
const { buildFollowupPlan, buildSalesNextActions } = require('./services/sales-operator.service');
const { buildConversionIntelligence } = require('./services/conversion-intelligence.service');
const { buildPipeline } = require('./services/deal-pipeline.service');
const { buildRevenueLedger } = require('./services/revenue-ledger.service');
const memory = require('./operational-memory.service');
const { buildHealthOverview } = require('./health-monitor.service');
const { buildDiagnostics } = require('./diagnostic-engine.service');
const { buildImprovements } = require('./improvement-engine.service');
const { getPolicies } = require('./approval-policy.service');
const { runSafeRepair } = require('./self-repair.service');
const { buildDuplicateReport } = require('./duplicate-detector.service');
const { buildPerformanceReport } = require('./performance-analyzer.service');
const { buildProjectHealthScore } = require('./project-health-score.service');
const { listSafePatches, applySafePatch } = require('./safe-patch.service');
const { buildLearningSummary } = require('./learning-engine.service');
const { buildFragilityRanking } = require('./fragility-ranking.service');
const { buildPriorities } = require('./priority-engine.service');
const { buildEvolutionPlan } = require('./evolution-plan.service');
const { getActiveGoal, upsertGoal } = require('./services/goal-manager.service');
const { buildSystemSnapshot } = require('./services/system-snapshot.service');
const { runAutonomyCycle } = require('./services/autonomy-cycle.service');
const { calculateRisk } = require('./services/risk-engine.service');
const { chooseDecision } = require('./services/decision-engine.service');
const { classifyAction } = require('./services/policy-engine.service');
const { getMissionOverview, enqueueMission, activateMission, completeMission } = require('./services/mission-queue.service');
const { selectNextMission } = require('./services/mission-selector.service');
const { buildPatchResult } = require('./services/safe-patch-engine.service');
const { buildMultiFilePatch } = require('./services/multi-file-patch-engine.service');
const { rankMissionsByImpact } = require('./services/mission-impact-engine.service');
const { validateDependencies } = require('./services/dependency-validator.service');
const { createScheduler } = require('./services/autonomy-scheduler.service');
const { buildCompositeGoals } = require('./services/composite-goal-engine.service');
const { buildStagePlan } = require('./services/multi-stage-planner.service');
const { buildFutureImpact } = require('./services/future-impact-engine.service');
const { buildRoadmap } = require('./services/roadmap-generator.service');
const { buildLongRangePriorities } = require('./services/long-range-priority.service');
const { buildBrains, summarizeBrains } = require('./services/brain-registry.service');
const { buildModuleSpecializations } = require('./services/module-specialization.service');
const { buildDelegationPlan, dispatchDelegation } = require('./services/delegation-engine.service');
const { buildSharedGoals, createSharedGoal } = require('./services/shared-goal-engine.service');
const { buildConsensus } = require('./services/consensus-engine.service');
const { buildCoordinationPlan, executeCoordination } = require('./services/brain-coordination.service');
const { buildCapabilities, expandCapabilities } = require('./services/capability-expansion.service');
const { listGeneratedBrains, createBrain } = require('./services/brain-creation.service');
const { buildAuditReport, runAudit } = require('./services/internal-audit.service');
const { buildGrowthPlan } = require('./services/specialization-growth.service');
const { buildSelfOptimization } = require('./services/self-optimization.service');
const { buildPerformanceLedger } = require('./services/brain-performance-ledger.service');
const { buildFusionOpportunities, fuseBrains } = require('./services/brain-fusion.service');
const { buildRetirementQueue, retireBrain } = require('./services/brain-retirement.service');
const { buildMeritRanking } = require('./services/merit-engine.service');
const { rebalanceIntelligence } = require('./services/intelligence-rebalancer.service');
const { rebalanceResources } = require('./services/resource-allocation.service');
const { buildResourceStatus } = require('./services/resource-economy.service');
const { buildBudgetStatus, recalculateBudget } = require('./services/cognitive-budget.service');
const { buildEnergyStatus, optimizeEnergy } = require('./services/energy-optimization.service');
const { buildEfficiencyLedger } = require('./services/efficiency-ledger.service');
const { buildBrainReputations } = require('./services/brain-reputation.service');
const { buildInternalMarketStatus } = require('./services/internal-market.service');
const { buildAuctions, runAuction } = require('./services/project-auction.service');
const { buildPriorityBids, recalculatePriorityBids } = require('./services/priority-bidding.service');
const { buildOpportunityAllocation } = require('./services/opportunity-allocation.service');
const { buildGovernance } = require('./services/governance-engine.service');
const { buildLayeredPolicies, buildPolicyMatrix } = require('./services/layered-policy.service');
const { buildContextualVoting } = require('./services/contextual-voting.service');
const { buildGovernanceLedger } = require('./services/governance-ledger.service');
const { decideGovernanceAction } = require('./services/policy-orchestrator.service');
const { buildInternalConstitution } = require('./services/internal-constitution.service');
const { buildExceptionRules, evaluateException } = require('./services/exception-rules.service');
const { buildConflictTribunal, judgeConflict } = require('./services/conflict-tribunal.service');
const { buildLegalPrecedentLedger } = require('./services/legal-precedent-ledger.service');
const { reviewActionAgainstConstitution } = require('./services/constitutional-review.service');
const { buildEmergencyRules, evaluateEmergency } = require('./services/emergency-rules.service');
const { buildCrisisStatus, triggerCrisis } = require('./services/crisis-mode.service');
const { buildContainmentPlan, containFailure } = require('./services/failure-containment.service');
const { buildIsolationStatus, isolateModule } = require('./services/module-isolation.service');
const { buildRecoveryProtocol, recoverSystem } = require('./services/recovery-protocol.service');
const { buildIncidentLedger } = require('./services/incident-ledger.service');
const { buildUnifiedCognition } = require('./services/unified-cognition.service');
const { proposeEvolution, applySupervisedEvolution } = require('./services/supervised-evolution.service');
const { buildContinuousOrganism } = require('./services/continuous-organism.service');
const { buildOrganismHealth } = require('./services/organism-health.service');
const { buildStrategicBalance } = require('./services/strategic-balance.service');
const { listEpisodes, recordEpisode } = require('./services/episodic-memory.service');
const { buildLearningNarrative } = require('./services/learning-narrative.service');
const { recallExperiences } = require('./services/experience-recall.service');
const { buildMemoryIndex } = require('./services/memory-indexer.service');
const { buildLessonsLedger } = require('./services/lessons-ledger.service');
const { buildFutureScenarios } = require('./services/future-simulation.service');
const { buildProbabilityMatrix } = require('./services/probability-engine.service');
const { rankScenarios } = require('./services/scenario-ranking.service');
const { buildDecisionForecast } = require('./services/decision-forecast.service');
const { appendForecastLedger, buildForecastHistory } = require('./services/forecast-ledger.service');
const { buildStrategicIdeas } = require('./services/strategic-creativity.service');
const { synthesizeSolution } = require('./services/solution-synthesis.service');
const { runBreakthrough } = require('./services/breakthrough-engine.service');
const { buildInnovationHistory, appendInnovation } = require('./services/innovation-ledger.service');
const { rankIdeas } = require('./services/idea-ranking.service');

const { analyzeHumanContext } = require('./services/human-context.service');
const { buildInterfaceProfile, adaptInterface } = require('./services/emotional-interface.service');
const { scoreCommunication } = require('./services/communication-optimizer.service');
const { appendInteraction, listInteractions } = require('./services/interaction-memory.service');
const { buildExperienceLedger } = require('./services/experience-ledger.service');


function randomId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEvent(type, severity, source, title, details, meta = {}) {
  return { id: randomId('evt'), type, severity, source, title, details, meta, createdAt: new Date().toISOString() };
}

function createFingerprint(parts = []) {
  return parts.filter(Boolean).join('|').toLowerCase().replace(/\s+/g, '_').slice(0, 180);
}

function normalizeClientError(payload = {}) {
  return {
    source: payload.source || 'frontend',
    message: payload.message || 'Erro de cliente não detalhado.',
    stack: payload.stack || '',
    path: payload.path || '/',
    severity: payload.severity || 'warning',
    module: payload.module || 'frontend',
    context: payload.context || {},
    fingerprint: payload.fingerprint || createFingerprint([payload.module || 'frontend', payload.path || '/', payload.message || 'unknown']),
  };
}

function ensureQueues(state) {
  return {
    ...state,
    incidents: state.incidents || [],
    approvals: state.approvals || [],
    approvalBacklog: state.approvalBacklog || [],
    rollbackQueue: state.rollbackQueue || [],
    missions: state.missions || [],
    governanceHistory: state.governanceHistory || [],
  };
}

function buildSnapshot(state) {
  const health = buildHealthOverview();
  const diagnostics = buildDiagnostics(health);
  const duplicateReport = buildDuplicateReport();
  const performanceReport = buildPerformanceReport();
  const improvements = buildImprovements(health, duplicateReport, performanceReport);
  const projectHealth = buildProjectHealthScore({ health, diagnostics, duplicateReport, performanceReport, approvals: state.approvals || [] });
  return { health, diagnostics, duplicateReport, performanceReport, improvements, projectHealth };
}

const scheduler = createScheduler(() => runAutonomyCycle({ memory, dashboardBuilder: buildDashboard, performanceBuilder: buildPerformanceReport, duplicateBuilder: buildDuplicateReport, projectHealthBuilder: buildProjectHealthScore, improvementBuilder: buildImprovements, triggeredBy: 'timer' }));

function buildDashboard() {
  const rawState = memory.readState();
  const state = ensureQueues(rawState);
  const snapshot = buildSnapshot(state);
  const openErrors = (state.errors || []).filter((item) => item.status !== 'resolved');
  const recentRepairs = (state.repairs || []).slice(0, 5);
  const activeGoal = getActiveGoal(state.goals || []);
  const missionOverview = getMissionOverview(state.missions || []);

  return {
    ok: true,
    version: '3.8.0',
    autonomyMode: state.state.mode,
    summary: {
      score: snapshot.projectHealth.totalScore,
      runtimeScore: snapshot.health.score,
      openErrors: openErrors.length,
      openIncidents: (state.incidents || []).filter((item) => item.status !== 'resolved').length,
      pendingApprovals: (state.approvalBacklog || []).filter((item) => item.status === 'pending').length,
      pendingHumanApprovals: (state.approvals || []).filter((item) => item.status === 'pending').length,
      repairReadiness: 91,
      improvementBacklog: snapshot.improvements.suggestions.length,
      duplicateCount: snapshot.duplicateReport.duplicateCount,
      performanceScore: snapshot.performanceReport.score,
      missionQueueSize: missionOverview.queued.length,
      rollbackReady: (state.rollbackQueue || []).filter((item) => item.status === 'ready').length,
      lastDiagnosticAt: state.lastDiagnosticAt,
      lastRepairAt: state.lastRepairAt,
    },
    state: state.state,
    consensus: state.consensusHistory?.[0] || null,
    coordination: state.coordinationHistory?.[0] || null,
    sharedGoals: buildSharedGoals(state).items,
    activeGoal,
    missionQueue: missionOverview,
    missionImpactRanking: rankMissionsByImpact(state.missions || [], state).slice(0, 6),
    goals: state.goals || [],
    history: (state.history || []).slice(0, 20),
    ...snapshot,
    recentRepairs,
    incidents: (state.incidents || []).slice(0, 10),
    approvals: (state.approvals || []).slice(0, 10),
    approvalBacklog: (state.approvalBacklog || []).slice(0, 10),
    rollbackQueue: (state.rollbackQueue || []).slice(0, 10),
    safePatches: listSafePatches().patches,
    policies: state.policies,
    staticPolicies: getPolicies(),
    memoryHighlights: (state.memory || []).slice(0, 5),
    resourceEconomy: buildResourceStatus(state),
    cognitiveBudget: buildBudgetStatus(state),
    energy: buildEnergyStatus(state),
    efficiencyLedger: buildEfficiencyLedger(state),
    generatedAt: new Date().toISOString(),
  };
}

function getLearningSummary() { return buildLearningSummary(ensureQueues(memory.readState())); }
function getFragilityRanking() {
  const state = ensureQueues(memory.readState());
  return buildFragilityRanking({ duplicateReport: buildDuplicateReport(), performanceReport: buildPerformanceReport(), errors: state.errors || [], incidents: state.incidents || [] });
}
function getPriorities() {
  return buildPriorities({ fragilityRanking: getFragilityRanking(), improvements: buildDashboard().improvements, learningSummary: getLearningSummary(), projectHealth: buildDashboard().projectHealth });
}
function getEvolutionPlan() { return buildEvolutionPlan({ priorities: getPriorities().priorities, projectHealth: buildDashboard().projectHealth }); }
function getExecutiveDashboard() {
  const dashboard = buildDashboard();
  return { ok: true, mission: dashboard.state.currentMission, goal: dashboard.activeGoal, scores: dashboard.projectHealth, priorities: getPriorities().priorities, missionQueue: dashboard.missionQueue, generatedAt: new Date().toISOString() };
}
function getSafePatches() { return listSafePatches(); }
function listEvents() { return memory.readState().events || []; }
function listErrors() { return memory.readState().errors || []; }
function listRepairs() { return memory.readState().repairs || []; }
function listIncidents() { return memory.readState().incidents || []; }
function listApprovals() { return memory.readState().approvals || []; }
function listImprovements() { return memory.readState().improvements || []; }
function getDuplicateReport() { return buildDuplicateReport(); }
function getPerformanceReport() { return buildPerformanceReport(); }
function getProjectHealthScore() { return buildDashboard().projectHealth; }

function listMissions() {
  const state = ensureQueues(memory.readState());
  return { ok: true, ...getMissionOverview(state.missions || []) };
}

function createMission(payload = {}) {
  const state = ensureQueues(memory.readState());
  state.missions = enqueueMission(state.missions || [], payload);
  const activeMission = getMissionOverview(state.missions).active;
  if (activeMission) { state.state.currentMission = activeMission.title; state.state.currentMissionId = activeMission.id; }
  memory.writeState(state);
  return { ok: true, missions: getMissionOverview(state.missions) };
}

function activateMissionById(payload = {}) {
  const state = ensureQueues(memory.readState());
  state.missions = activateMission(state.missions || [], payload.missionId);
  const activeMission = getMissionOverview(state.missions).active;
  state.state.currentMission = activeMission?.title || state.state.currentMission;
  state.state.currentMissionId = activeMission?.id || state.state.currentMissionId;
  memory.writeState(state);
  return { ok: true, missions: getMissionOverview(state.missions), activeMission };
}

function completeMissionById(payload = {}) {
  const state = ensureQueues(memory.readState());
  state.missions = completeMission(state.missions || [], payload.missionId);
  const overview = getMissionOverview(state.missions);
  state.state.currentMission = overview.active?.title || state.state.currentMission;
  state.state.currentMissionId = overview.active?.id || state.state.currentMissionId;
  memory.writeState(state);
  return { ok: true, missions: overview };
}

function runDiagnosticsNow() {
  const diagnostics = buildDashboard().diagnostics;
  const state = memory.readState();
  state.lastDiagnosticAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, diagnostics, recordedAt: state.lastDiagnosticAt };
}

function runSafeRepairNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = runSafeRepair(payload, state);
  const repairEntry = { id: randomId('rep'), actionType: payload.actionType || 'fallback_safe_mode', executionMode: result.mode, status: result.ok ? 'applied' : 'blocked', resultSummary: result.resultSummary, createdAt: result.executedAt };
  state.repairs = [repairEntry, ...(state.repairs || [])].slice(0, 40);
  state.lastRepairAt = repairEntry.createdAt;
  memory.writeState(state);
  return { ok: result.ok, repair: repairEntry, result };
}

function runSafePatchNow(payload = {}) {
  const actionType = payload.actionType || 'patch_runtime_fallback';
  const result = applySafePatch(actionType);
  return { ok: result.ok, patch: result };
}

function approveAction(payload = {}) {
  const state = ensureQueues(memory.readState());
  const approvalId = payload.approvalId;
  state.approvals = (state.approvals || []).map((item) => item.id === approvalId ? { ...item, status: 'approved', decidedAt: new Date().toISOString() } : item);
  state.approvalBacklog = (state.approvalBacklog || []).map((item) => item.id === approvalId ? { ...item, status: 'approved', decidedAt: new Date().toISOString() } : item);
  memory.writeState(state);
  return { ok: true, approvalId, status: 'approved' };
}

function rejectAction(payload = {}) {
  const state = ensureQueues(memory.readState());
  const approvalId = payload.approvalId;
  state.approvals = (state.approvals || []).map((item) => item.id === approvalId ? { ...item, status: 'rejected', decidedAt: new Date().toISOString() } : item);
  state.approvalBacklog = (state.approvalBacklog || []).map((item) => item.id === approvalId ? { ...item, status: 'rejected', decidedAt: new Date().toISOString() } : item);
  memory.writeState(state);
  return { ok: true, approvalId, status: 'rejected' };
}

function triggerRollback(payload = {}) {
  const state = ensureQueues(memory.readState());
  const rollbackId = payload.rollbackId;
  state.rollbackQueue = (state.rollbackQueue || []).map((item) => item.id === rollbackId ? { ...item, status: 'executed', executedAt: new Date().toISOString() } : item);
  const rollbackItem = (state.rollbackQueue || []).find((item) => item.id === rollbackId) || null;
  const repairEntry = { id: randomId('rep'), actionType: rollbackItem?.targetAction || 'rollback', executionMode: 'validated', status: 'applied', resultSummary: 'Rollback preventivo executado com segurança.', createdAt: new Date().toISOString() };
  state.repairs = [repairEntry, ...(state.repairs || [])].slice(0, 40);
  state.lastRepairAt = repairEntry.createdAt;
  memory.writeState(state);
  return { ok: true, rollbackId, rollback: rollbackItem, repair: repairEntry };
}

function reportClientError(payload = {}) {
  const normalized = normalizeClientError(payload);
  const state = ensureQueues(memory.readState());
  const event = createEvent('client_error', normalized.severity, normalized.source, normalized.message, `Path: ${normalized.path}`, { module: normalized.module, fingerprint: normalized.fingerprint });
  const errorEntry = { id: randomId('err'), eventId: event.id, module: normalized.module, errorType: 'client_runtime', probableCause: normalized.message, impactLevel: normalized.severity, status: 'open', title: normalized.message, createdAt: event.createdAt, resolvedAt: null, path: normalized.path, fingerprint: normalized.fingerprint };
  state.events = [event, ...(state.events || [])].slice(0, 60);
  state.errors = [errorEntry, ...(state.errors || [])].slice(0, 60);
  memory.writeState(state);
  return { ok: true, event, error: errorEntry };
}

function getStatus() {
  const dashboard = buildDashboard();
  const brains = buildBrains(memory.readState());
  return { ok: true, state: dashboard.state, activeGoal: dashboard.activeGoal, activeMission: dashboard.missionQueue.active, summary: dashboard.summary, brains: summarizeBrains(brains), generatedAt: dashboard.generatedAt };
}

function getSystemSnapshot() {
  const dashboard = buildDashboard();
  const ranking = rankMissionsByImpact(dashboard.missionQueue.all || [], memory.readState());
  const stages = buildStagePlan({ goals: dashboard.goals || [], missions: dashboard.missionQueue.all || [], ranking }).items;
  const compositeGoals = buildCompositeGoals(dashboard.goals || [], dashboard.missionQueue.all || [], stages).items;
  const futureImpact = buildFutureImpact({ ranking, adaptiveScores: getAdaptiveScores().scores, stages });
  const roadmapResult = buildRoadmap({ goals: dashboard.goals || [], stages, ranking });
  const priorities = buildLongRangePriorities({ goals: dashboard.goals || [], futureImpact, ranking });
  const state = ensureQueues(memory.readState());
  const brains = buildBrains(state);
  const moduleSpecializations = buildModuleSpecializations();
  const delegation = buildDelegationPlan({ mission: dashboard.missionQueue.active || { title: dashboard.state.currentMission }, state });
  const capabilities = buildCapabilities(state);
  const audit = buildAuditReport(state);
  const growthPlan = buildGrowthPlan(state);
  const selfOptimization = buildSelfOptimization(state);
  const market = buildInternalMarketStatus(state);
  const auctions = buildAuctions(state);
  const priorityBids = buildPriorityBids(state);
  const opportunityAllocation = buildOpportunityAllocation(state);
  return buildSystemSnapshot({ dashboard, activeGoal: dashboard.activeGoal, state: dashboard.state, policies: dashboard.policies, missions: dashboard.missionQueue.all, approvalBacklog: dashboard.approvalBacklog, rollbackQueue: dashboard.rollbackQueue, strategic: { compositeGoals, stages, futureImpact, roadmap: roadmapResult.items, priorities }, brains, moduleSpecializations, delegation, delegationHistory: state.delegationHistory || [], market, auctions, priorityBids, opportunityAllocation, capabilities, audit, growthPlan, selfOptimization, intelligenceRebalance: state.intelligenceRebalance || null, generatedBrains: listGeneratedBrains(state).items });
}

function getHistory() { const state = memory.readState(); return { ok: true, items: state.history || [], generatedAt: new Date().toISOString() }; }

function setGoal(payload = {}) {
  const state = memory.readState();
  const goals = upsertGoal(state.goals || [], payload);
  const activeGoal = getActiveGoal(goals);
  state.goals = goals;
  state.state.currentGoal = activeGoal?.title || state.state.currentGoal;
  state.state.currentMission = payload.mission || state.state.currentMission;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, goal: activeGoal, goals };
}

function setPolicyMode(payload = {}) {
  const mode = payload.mode || 'supervised_autonomy';
  const state = memory.readState();
  state.policies.currentMode = mode;
  state.policies.updatedAt = new Date().toISOString();
  state.state.mode = mode;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, mode, policies: state.policies };
}

function simulateDecision(payload = {}) {
  const dashboard = buildDashboard();
  const priorities = getPriorities().priorities;
  const decision = chooseDecision({ activeGoal: dashboard.activeGoal, priorities, mode: payload.mode || dashboard.state.mode, activeMission: dashboard.missionQueue.active, approvalBacklog: dashboard.approvalBacklog });
  const action = payload.actionType || decision.actionType;
  const risk = calculateRisk({ priority: priorities[0]?.priority || 'medium', mode: payload.mode || dashboard.state.mode, actionType: action });
  const policy = classifyAction(action, dashboard.policies);
  return { ok: true, simulated: { ...decision, actionType: action, policy, risk }, generatedAt: new Date().toISOString() };
}

function runCycle() {
  return runAutonomyCycle({ memory, dashboardBuilder: buildDashboard, performanceBuilder: buildPerformanceReport, duplicateBuilder: buildDuplicateReport, projectHealthBuilder: buildProjectHealthScore, improvementBuilder: buildImprovements });
}


function getTimerStatus() {
  const state = ensureQueues(memory.readState());
  return scheduler.status(state);
}

function startTimer() {
  const state = ensureQueues(memory.readState());
  state.state.timerEnabled = true;
  state.state.continuousMode = true;
  state.state.mode = 'continuous_autonomy';
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return scheduler.start(state);
}

function stopTimer() {
  const state = ensureQueues(memory.readState());
  state.state.timerEnabled = false;
  state.state.continuousMode = false;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  scheduler.stop();
  return { ok: true, running: false, intervalMs: state.state.timerIntervalMs };
}

function tickTimer() {
  const result = runAutonomyCycle({ memory, dashboardBuilder: buildDashboard, performanceBuilder: buildPerformanceReport, duplicateBuilder: buildDuplicateReport, projectHealthBuilder: buildProjectHealthScore, improvementBuilder: buildImprovements, triggeredBy: 'timer' });
  return { ok: true, ...result };
}

function selectNextMissionNow() {
  const state = ensureQueues(memory.readState());
  const selection = selectNextMission(state.missions || [], state);
  state.missions = selection.missions;
  if (selection.selected) {
    state.state.currentMission = selection.selected.title;
    state.state.currentMissionId = selection.selected.id;
    state.state.nextMissionSuggestion = selection.selected;
    state.state.lastAutoSelection = {
      missionId: selection.selected.id,
      title: selection.selected.title,
      reason: selection.reason,
      createdAt: new Date().toISOString(),
    };
  }
  memory.writeState(state);
  return { ok: true, ...selection, missions: getMissionOverview(state.missions || []) };
}

function applySafePatchNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = buildPatchResult({
    state,
    actionType: payload.actionType || 'update_autonomy_state',
    mission: (getMissionOverview(state.missions || {}).active) || null,
    mode: state.state.mode,
  });
  memory.writeState(result.state);
  return { ok: result.ok, patch: result.patch, classification: result.classification, resultSummary: result.resultSummary };
}

function getPatchHistory() {
  const state = ensureQueues(memory.readState());
  return { ok: true, items: state.patchHistory || [] };
}

function getAdaptiveScores() {
  const state = ensureQueues(memory.readState());
  return { ok: true, scores: { autonomy: state.state.autonomyScore || 0, stability: state.state.stabilityScore || 0, maturity: state.state.maturityScore || 0, assertiveness: state.state.assertivenessScore || 0, operationalRisk: state.state.operationalRiskScore || 0, resolutionVelocity: state.state.resolutionVelocityScore || 0, updatedAt: state.state.updatedAt || new Date().toISOString() } };
}

function rankMissionImpactNow() {
  const state = ensureQueues(memory.readState());
  const ranking = rankMissionsByImpact(state.missions || [], state);
  state.missionImpactHistory = [{ id: `impact-${Date.now()}`, ranking: ranking.slice(0, 8).map((item) => ({ missionId: item.mission.id, title: item.mission.title, totalScore: item.impact.totalScore })), createdAt: new Date().toISOString() }, ...(state.missionImpactHistory || [])].slice(0, 40);
  memory.writeState(state);
  return { ok: true, ranking };
}

function selectBestMissionNow() {
  const state = ensureQueues(memory.readState());
  const selection = selectNextMission(state.missions || [], state);
  state.missions = selection.missions;
  if (selection.selected) {
    state.state.currentMission = selection.selected.title;
    state.state.currentMissionId = selection.selected.id;
    state.state.nextMissionSuggestion = selection.selected;
  }
  memory.writeState(state);
  return { ok: true, selected: selection.selected, reason: selection.reason, ranking: selection.ranking || [] };
}

function validateMultiPatchNow(payload = {}) {
  const validation = validateDependencies({ files: payload.files || [] });
  return { ok: validation.ok, validation };
}

function applyMultiPatchNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const mission = (getMissionOverview(state.missions || {}).active) || null;
  const result = buildMultiFilePatch({ state, payload, mission, mode: state.state.mode });
  memory.writeState(result.state);
  return { ok: result.ok, patch: result.patch, validation: result.validation, resultSummary: result.resultSummary };
}


function getCompositeGoals() {
  const state = ensureQueues(memory.readState());
  const ranking = rankMissionsByImpact(state.missions || [], state);
  const stages = buildStagePlan({ goals: state.goals || [], missions: state.missions || [], ranking }).items;
  return buildCompositeGoals(state.goals || [], state.missions || [], stages);
}

function createCompositeGoal(payload = {}) {
  const state = ensureQueues(memory.readState());
  const id = payload.id || `goal-${Date.now()}`;
  const goal = {
    id,
    title: payload.title || 'Meta composta estratégica',
    summary: payload.summary || 'Meta criada para organizar evolução multi-etapas da Megan.',
    type: payload.type || 'composite_evolution',
    status: 'active',
    priority: payload.priority || 'high',
    successCriteria: Array.isArray(payload.successCriteria) && payload.successCriteria.length ? payload.successCriteria : ['Executar etapas sem regressão estrutural', 'Aumentar autonomia com estabilidade'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.goals = [goal, ...(state.goals || [])];
  memory.writeState(state);
  return { ok: true, goal, compositeGoals: getCompositeGoals().items };
}

function getPlannerStages() {
  const state = ensureQueues(memory.readState());
  const ranking = rankMissionsByImpact(state.missions || [], state);
  return buildStagePlan({ goals: state.goals || [], missions: state.missions || [], ranking });
}

function getFutureImpact() {
  const state = ensureQueues(memory.readState());
  const ranking = rankMissionsByImpact(state.missions || [], state);
  const adaptiveScores = getAdaptiveScores().scores;
  const stages = buildStagePlan({ goals: state.goals || [], missions: state.missions || [], ranking }).items;
  return buildFutureImpact({ ranking, adaptiveScores, stages });
}

function getRoadmap() {
  const state = ensureQueues(memory.readState());
  const ranking = rankMissionsByImpact(state.missions || [], state);
  const stages = buildStagePlan({ goals: state.goals || [], missions: state.missions || [], ranking }).items;
  const roadmap = buildRoadmap({ goals: state.goals || [], stages, ranking });
  const priorities = buildLongRangePriorities({ goals: state.goals || [], futureImpact: getFutureImpact(), ranking });
  return { ok: true, roadmap: roadmap.items, priorities, generatedAt: roadmap.generatedAt };
}

function regenerateRoadmap() {
  const roadmap = getRoadmap();
  const state = ensureQueues(memory.readState());
  state.history = [{ id: randomId('cycle'), decision: { title: 'Roadmap regenerado', actionType: 'regenerate_roadmap' }, execution: { status: 'completed', summary: 'Roadmap estratégico atualizado pelo núcleo 1.8.' }, validation: { approved: true, summary: 'Roadmap consistente com metas compostas.' }, createdAt: new Date().toISOString() }, ...(state.history || [])].slice(0, 80);
  memory.writeState(state);
  return { ok: true, ...roadmap, resultSummary: 'Roadmap regenerado com sucesso.' };
}



function getSharedGoals() {
  const state = ensureQueues(memory.readState());
  return buildSharedGoals(state);
}

function createSharedGoalNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = createSharedGoal(state, payload);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, goal: result.goal, items: result.sharedGoals };
}

function getConsensusStatus() {
  const state = ensureQueues(memory.readState());
  const activeMission = getMissionOverview(state.missions || []).active;
  const consensus = buildConsensus({ state, mission: activeMission, candidateAction: { title: activeMission?.title || state.state.currentMission || 'Próxima ação coordenada' } });
  return { ok: true, consensus, history: (state.consensusHistory || []).slice(0, 20) };
}

function decideByConsensus(payload = {}) {
  const state = ensureQueues(memory.readState());
  const mission = (state.missions || []).find((item) => item.id === payload.missionId) || getMissionOverview(state.missions || []).active || null;
  const consensus = buildConsensus({ state, mission, candidateAction: payload.candidateAction || { title: mission?.title || payload.title || 'Ação consensual' } });
  state.consensusHistory = [{
    id: randomId('cns'),
    missionId: mission?.id || null,
    action: consensus.action,
    approvalRate: consensus.approvalRate,
    consensusLevel: consensus.consensusLevel,
    approved: consensus.approved,
    createdAt: new Date().toISOString(),
  }, ...(state.consensusHistory || [])].slice(0, 50);
  state.state.consensusScore = consensus.averageSupport;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, consensus, history: state.consensusHistory };
}

function getCoordinationStatus() {
  const state = ensureQueues(memory.readState());
  const activeMission = getMissionOverview(state.missions || []).active || null;
  const plan = buildCoordinationPlan({ state, mission: activeMission });
  return { ok: true, plan, history: (state.coordinationHistory || []).slice(0, 20) };
}

function executeCoordinatedMission(payload = {}) {
  const state = ensureQueues(memory.readState());
  const mission = (state.missions || []).find((item) => item.id === payload.missionId) || getMissionOverview(state.missions || []).active || null;
  const result = executeCoordination({ state, mission });
  state.coordinationHistory = [{
    id: randomId('crd'),
    missionId: mission?.id || null,
    missionTitle: mission?.title || 'Missão coordenada',
    leadBrain: result.plan.leadBrain?.id || null,
    supportBrains: (result.plan.supportBrains || []).map((item) => item.id),
    status: result.status,
    createdAt: new Date().toISOString(),
  }, ...(state.coordinationHistory || [])].slice(0, 50);
  if (result.plan.leadBrain?.id) {
    state.state.activeBrain = result.plan.leadBrain.id;
  }
  state.state.coordinationScore = Math.min(100, Math.max(Number(state.state.coordinationScore || 58), result.plan.consensus.averageSupport || 0));
  state.state.consensusScore = result.plan.consensus.averageSupport || state.state.consensusScore || 0;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, ...result, history: state.coordinationHistory };
}

function getBrains() {
  const state = ensureQueues(memory.readState());
  const brains = buildBrains(state);
  return { ok: true, brains, summary: summarizeBrains(brains), generatedAt: new Date().toISOString() };
}

function getModuleSpecializations() {
  return { ok: true, items: buildModuleSpecializations(), generatedAt: new Date().toISOString() };
}

function buildDelegation(payload = {}) {
  const state = ensureQueues(memory.readState());
  const mission = (state.missions || []).find((item) => item.id === payload.missionId) || getMissionOverview(state.missions || []).active || { id: 'adhoc', title: payload.title || 'Missão ad hoc', summary: payload.summary || 'Delegação gerada sem missão ativa.' };
  return buildDelegationPlan({ mission, state });
}

function dispatchDelegationNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const mission = (state.missions || []).find((item) => item.id === payload.missionId) || getMissionOverview(state.missions || []).active || { id: 'adhoc', title: payload.title || 'Missão ad hoc', summary: payload.summary || 'Despacho sem missão ativa.' };
  const result = dispatchDelegation({ mission, state });
  state.delegationHistory = [{ id: randomId('dlg'), missionId: mission.id || null, missionTitle: mission.title, primaryBrain: result.plan.primaryBrain?.id || null, supportBrains: (result.plan.supportBrains || []).map((item) => item.id), status: result.status, createdAt: new Date().toISOString() }, ...(state.delegationHistory || [])].slice(0, 40);
  if (result.plan.primaryBrain?.id) {
    state.state.activeBrain = result.plan.primaryBrain.id;
    state.state.coordinationScore = Math.min(100, Number(state.state.coordinationScore || 58) + 4);
    state.state.updatedAt = new Date().toISOString();
  }
  memory.writeState(state);
  return { ok: true, ...result, history: state.delegationHistory };
}


function getCapabilities() {
  const state = ensureQueues(memory.readState());
  return buildCapabilities(state);
}

function expandCapabilitiesNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = expandCapabilities(state, payload);
  memory.writeState(result.state);
  return { ok: true, capability: result.capability, items: result.items };
}

function getGeneratedBrains() {
  const state = ensureQueues(memory.readState());
  return listGeneratedBrains(state);
}

function createBrainNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = createBrain(state, payload);
  memory.writeState(result.state);
  return { ok: true, brain: result.brain, items: result.items };
}

function getAuditReport() {
  const state = ensureQueues(memory.readState());
  return buildAuditReport(state);
}

function runAuditNow() {
  const state = ensureQueues(memory.readState());
  const result = runAudit(state);
  memory.writeState(result.state);
  return { ok: true, report: result.report };
}

function getGrowthPlan() {
  const state = ensureQueues(memory.readState());
  return buildGrowthPlan(state);
}

function getSelfOptimization() {
  const state = ensureQueues(memory.readState());
  return buildSelfOptimization(state);
}

function getBrainPerformance() {
  const state = ensureQueues(memory.readState());
  return buildPerformanceLedger(state);
}

function getBrainRanking() {
  const state = ensureQueues(memory.readState());
  return buildMeritRanking(state);
}

function getFusionOpportunities() {
  const state = ensureQueues(memory.readState());
  return buildFusionOpportunities(state);
}

function getRetirementQueue() {
  const state = ensureQueues(memory.readState());
  return buildRetirementQueue(state);
}

function fuseBrainsNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = fuseBrains(state, payload);
  const ranking = buildMeritRanking(result.state).items;
  result.state.state.coordinationScore = Math.min(100, Number(result.state.state.coordinationScore || 58) + 3);
  result.state.state.maturityScore = Math.min(100, Number(result.state.state.maturityScore || 22) + 2);
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, fusion: result.fusion, history: result.items, ranking };
}

function retireBrainNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = retireBrain(state, payload);
  result.state.state.auditScore = Math.min(100, Number(result.state.state.auditScore || 74) + 1);
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, retired: result.retired, history: result.items };
}

function rebalanceIntelligenceNow() {
  const state = ensureQueues(memory.readState());
  const ranking = buildMeritRanking(state).items;
  const result = rebalanceIntelligence(state, ranking);
  result.state.state.activeBrain = result.plan.leader?.id || result.state.state.activeBrain;
  result.state.state.coordinationScore = Math.min(100, Number(result.state.state.coordinationScore || 58) + 5);
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, plan: result.plan, ranking };
}


function getResourceStatus() { const state = ensureQueues(memory.readState()); return buildResourceStatus(state); }
function rebalanceResourcesNow() { const state = ensureQueues(memory.readState()); const result = rebalanceResources(state); memory.writeState(result.state); return { ok: true, resources: result.resources }; }
function getBudgetStatus() { const state = ensureQueues(memory.readState()); return buildBudgetStatus(state); }
function recalculateBudgetNow() { const state = ensureQueues(memory.readState()); const result = recalculateBudget(state); memory.writeState(result.state); return { ok: true, budget: result.budget }; }
function getEnergyStatus() { const state = ensureQueues(memory.readState()); return buildEnergyStatus(state); }
function optimizeEnergyNow() { const state = ensureQueues(memory.readState()); const result = optimizeEnergy(state); memory.writeState(result.state); return { ok: true, energy: result.energy, history: result.history }; }
function getEfficiencyLedger() { const state = ensureQueues(memory.readState()); return buildEfficiencyLedger(state); }

function getMarketStatus() { const state = ensureQueues(memory.readState()); return buildInternalMarketStatus(state); }
function openMarketNow() {
  const state = ensureQueues(memory.readState());
  const market = buildInternalMarketStatus(state);
  state.marketHistory = [{ id: `market-${Date.now()}`, createdAt: new Date().toISOString(), liquidity: market.liquidity, attentionUnits: market.attentionUnits, priceIndex: market.priceIndex }, ...(state.marketHistory || [])].slice(0, 30);
  memory.writeState(state);
  return { ok: true, market, history: state.marketHistory };
}
function getAuctions() { const state = ensureQueues(memory.readState()); return buildAuctions(state); }
function runAuctionNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = runAuction(state, payload);
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, allocation: result.allocation, auctions: result.auctions, opportunityAllocation: buildOpportunityAllocation(result.state) };
}
function getPriorityBids() { const state = ensureQueues(memory.readState()); return buildPriorityBids(state); }
function recalculatePriorityNow() {
  const state = ensureQueues(memory.readState());
  const result = recalculatePriorityBids(state);
  result.state.state.currentPriority = result.bids.winner?.missionId || result.state.state.currentPriority;
  result.state.state.currentPriorityLabel = result.bids.winner?.title || result.state.state.currentPriorityLabel;
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, bids: result.bids, opportunityAllocation: buildOpportunityAllocation(result.state) };
}
function getOpportunityAllocation() { const state = ensureQueues(memory.readState()); return buildOpportunityAllocation(state); }
function getBrainMarketReputation() { const state = ensureQueues(memory.readState()); return { ok: true, items: buildBrainReputations(state), generatedAt: new Date().toISOString() }; }


function getGovernanceStatus() { const state = ensureQueues(memory.readState()); return buildGovernance(state); }
function getLayeredPolicies() { const state = ensureQueues(memory.readState()); const layered = buildLayeredPolicies(state); return { ...layered, matrix: buildPolicyMatrix(state) }; }
function getVotingWeights(context = 'balanced') {
  const state = ensureQueues(memory.readState());
  const brains = buildBrains(state);
  return buildContextualVoting(brains, context);
}
function getGovernanceLedger() { const state = ensureQueues(memory.readState()); return buildGovernanceLedger(state); }
function runGovernanceVote(payload = {}) {
  const state = ensureQueues(memory.readState());
  const context = payload.context || 'balanced';
  const layered = buildLayeredPolicies(state);
  const voting = buildContextualVoting(buildBrains(state), context);
  const decision = decideGovernanceAction({ context, layeredPolicies: layered.layers, voting, payload });
  const entry = {
    id: randomId('gov'),
    context,
    payload,
    outcome: decision.outcome,
    dominantBrain: decision.dominantBrain || voting?.dominant?.id || 'autonomy',
    weightedApproval: decision.weightedApproval ?? null,
    recommendedMode: decision.recommendedMode,
    createdAt: new Date().toISOString(),
  };
  state.governanceHistory = [entry, ...(state.governanceHistory || [])].slice(0, 40);
  state.state.updatedAt = entry.createdAt;
  memory.writeState(state);
  return { ok: true, context, decision, voting, policies: layered, ledger: buildGovernanceLedger(state) };
}


function getInternalConstitution() {
  const state = ensureQueues(memory.readState());
  return buildInternalConstitution(state);
}
function getExceptionRules() {
  const state = ensureQueues(memory.readState());
  return buildExceptionRules(state);
}
function evaluateConstitutionException(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = evaluateException(payload, state);
  state.exceptionHistory = [result, ...(state.exceptionHistory || [])].slice(0, 40);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return result;
}
function getConflictTribunal() {
  const state = ensureQueues(memory.readState());
  return buildConflictTribunal(state);
}
function judgeAutonomyConflict(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = judgeConflict(payload, state);
  result.state.state.updatedAt = new Date().toISOString();
  memory.writeState(result.state);
  return { ok: true, verdict: result.verdict, tribunal: buildConflictTribunal(result.state), precedents: buildLegalPrecedentLedger(result.state) };
}
function getLegalPrecedents() {
  const state = ensureQueues(memory.readState());
  return buildLegalPrecedentLedger(state);
}
function reviewConstitutionalAction(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = reviewActionAgainstConstitution(payload, buildInternalConstitution(state), buildExceptionRules(state));
  state.constitutionalReviewHistory = [result, ...(state.constitutionalReviewHistory || [])].slice(0, 40);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return result;
}

function getEmergencyStatus() {
  const state = ensureQueues(memory.readState());
  return {
    ok: true,
    crisis: buildCrisisStatus(state),
    rules: buildEmergencyRules(state),
    containment: buildContainmentPlan(state, { module: 'autonomy', severity: state.state?.riskLevel || 'medium' }),
    isolation: buildIsolationStatus(state),
    recovery: buildRecoveryProtocol(state),
    generatedAt: new Date().toISOString(),
  };
}
function triggerEmergencyNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const evaluation = evaluateEmergency(payload, state);
  const result = triggerCrisis(state, payload);
  result.state.emergencyHistory = [{ id: randomId('emergency'), evaluation, createdAt: new Date().toISOString() }, ...(result.state.emergencyHistory || [])].slice(0, 50);
  memory.writeState(result.state);
  return { ok: true, evaluation, crisis: result.crisis, incident: result.incident };
}
function containEmergencyNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const contained = containFailure(state, payload);
  const isolated = isolateModule(contained.state, payload);
  memory.writeState(isolated.state);
  return { ok: true, containment: contained.containment, isolation: isolated.isolation, status: buildIsolationStatus(isolated.state) };
}
function recoverEmergencyNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = recoverSystem(state, payload);
  memory.writeState(result.state);
  return { ok: true, recovery: result.recovery, crisis: buildCrisisStatus(result.state), protocol: buildRecoveryProtocol(result.state) };
}
function getIncidentLedger() {
  const state = ensureQueues(memory.readState());
  return buildIncidentLedger(state);
}
function getCrisisMode() {
  const state = ensureQueues(memory.readState());
  return buildCrisisStatus(state);
}


function getOrganismStatus() { const state = ensureQueues(memory.readState()); return { ok: true, version: '3.8.0', organism: buildContinuousOrganism(state), cognition: buildUnifiedCognition(state), health: buildOrganismHealth(state), balance: buildStrategicBalance(state), generatedAt: new Date().toISOString() }; }
function getOrganismHealth() { return buildOrganismHealth(ensureQueues(memory.readState())); }
function getUnifiedCognition() { return buildUnifiedCognition(ensureQueues(memory.readState())); }
function getStrategicBalance() { return buildStrategicBalance(ensureQueues(memory.readState())); }
function proposeSupervisedEvolution(payload = {}) { const state = ensureQueues(memory.readState()); const result = proposeEvolution(state, payload); state.evolutionPipeline = [result.proposal, ...(state.evolutionPipeline || [])].slice(0, 40); state.state.updatedAt = new Date().toISOString(); memory.writeState(state); return { ...result, pipeline: state.evolutionPipeline }; }
function applySupervisedEvolutionNow(payload = {}) { const state = ensureQueues(memory.readState()); const result = applySupervisedEvolution(state, payload); state.evolutionExecutions = [result.execution, ...(state.evolutionExecutions || [])].slice(0, 40); state.state.organismMaturityScore = Math.min(100, (state.state.organismMaturityScore || 72) + (result.allowed ? 3 : 0)); state.state.updatedAt = new Date().toISOString(); memory.writeState(state); return { ...result, executions: state.evolutionExecutions }; }


function getForecastScenarios() {
  const state = ensureQueues(memory.readState());
  const scenarios = buildFutureScenarios(state);
  const probability = buildProbabilityMatrix(scenarios, state);
  const ranking = rankScenarios(scenarios, probability);
  return { ok: true, version: '3.3.0', scenarios, ranking, generatedAt: new Date().toISOString() };
}
function runForecastNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const scenarios = buildFutureScenarios({ ...state, forecastContext: payload });
  const probability = buildProbabilityMatrix(scenarios, state);
  const ranking = rankScenarios(scenarios, probability);
  const forecast = buildDecisionForecast(ranking);
  const ledger = appendForecastLedger(state, forecast);
  state.forecastLedger = ledger.history;
  state.state.forecastMaturityScore = Math.min(100, (state.state.forecastMaturityScore || 54) + 3);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...forecast, scenarios, probability, ranking, ledger: ledger.entry };
}
function getProbabilityMatrix() {
  const state = ensureQueues(memory.readState());
  const scenarios = buildFutureScenarios(state);
  return buildProbabilityMatrix(scenarios, state);
}
function getForecastBestPath() {
  const state = ensureQueues(memory.readState());
  const scenarios = buildFutureScenarios(state);
  const probability = buildProbabilityMatrix(scenarios, state);
  const ranking = rankScenarios(scenarios, probability);
  return buildDecisionForecast(ranking);
}
function getForecastHistory() {
  const state = ensureQueues(memory.readState());
  return buildForecastHistory(state);
}

function getMemoryEpisodes() { const state = ensureQueues(memory.readState()); const episodes = listEpisodes(state); return { ok: true, version: '3.8.0', episodes, index: buildMemoryIndex(episodes), generatedAt: new Date().toISOString() }; }
function createMemoryEpisode(payload = {}) { const state = ensureQueues(memory.readState()); const result = recordEpisode(state, payload); state.episodicMemory = result.episodes; state.state.episodicMemoryScore = Math.min(100, (state.state.episodicMemoryScore || 58) + 2); state.state.updatedAt = new Date().toISOString(); memory.writeState(state); return { ok: true, version: '3.8.0', episode: result.episode, episodes: result.episodes, index: buildMemoryIndex(result.episodes) }; }
function getLearningNarrative() { const state = ensureQueues(memory.readState()); return buildLearningNarrative(state, listEpisodes(state)); }
function getLessonsLedger() { const state = ensureQueues(memory.readState()); return buildLessonsLedger(listEpisodes(state)); }
function searchExperienceRecall(payload = {}) { const state = ensureQueues(memory.readState()); return recallExperiences(listEpisodes(state), payload); }


function getStrategicIdeas() {
  const state = ensureQueues(memory.readState());
  const ideas = rankIdeas(buildStrategicIdeas(state));
  return { ok: true, version: '3.3.0', ideas, generatedAt: new Date().toISOString() };
}
function generateStrategicIdeas(payload = {}) {
  const state = ensureQueues(memory.readState());
  const ideas = rankIdeas(buildStrategicIdeas(state, payload));
  state.innovationLedger = appendInnovation(state, { type: 'ideas_generated', title: 'Novas ideias estratégicas geradas', details: { count: ideas.length, context: payload.intent || 'geral' } });
  state.state.creativityScore = Math.min(100, (state.state.creativityScore || 56) + 3);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, version: '3.3.0', ideas, ledger: state.innovationLedger[0] };
}
function synthesizeStrategicSolution(payload = {}) {
  const state = ensureQueues(memory.readState());
  const ideas = rankIdeas(buildStrategicIdeas(state, payload));
  const result = synthesizeSolution(ideas, payload);
  state.solutionSynthesisHistory = [result.synthesis, ...(state.solutionSynthesisHistory || [])].slice(0, 50);
  state.innovationLedger = appendInnovation(state, { type: 'solution_synthesis', title: result.synthesis.title, details: result.synthesis });
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...result, history: state.solutionSynthesisHistory };
}
function runStrategicBreakthrough(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = runBreakthrough(state, payload);
  state.breakthroughHistory = [result, ...(state.breakthroughHistory || [])].slice(0, 50);
  state.innovationLedger = appendInnovation(state, { type: 'breakthrough', title: result.bestPath?.title || 'Breakthrough executado', details: result });
  state.state.breakthroughScore = Math.min(100, (state.state.breakthroughScore || 61) + 4);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...result, history: state.breakthroughHistory };
}
function getInnovationHistory() {
  const state = ensureQueues(memory.readState());
  return buildInnovationHistory(state);
}


function analyzeCurrentHumanContext(payload = {}) {
  const state = ensureQueues(memory.readState());
  const context = analyzeHumanContext(payload, state);
  const interaction = appendInteraction(state, {
    type: 'human_context_analysis',
    summary: `Contexto humano analisado em modo ${context.mode}`,
    contextMode: context.mode,
    pressureScore: context.pressureScore,
  });
  state.interactionMemory = interaction.history;
  state.state.humanAdaptationMode = context.mode;
  state.state.lastHumanPressureScore = context.pressureScore;
  state.state.communicationScore = Math.min(100, (state.state.communicationScore || 72) + 2);
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...context, interaction: interaction.item };
}
function getHumanInterfaceProfile() {
  const state = ensureQueues(memory.readState());
  const context = analyzeHumanContext({ text: state.lastHumanMessage || '' }, state);
  return buildInterfaceProfile(context, state);
}
function adaptHumanInterface(payload = {}) {
  const state = ensureQueues(memory.readState());
  const context = analyzeHumanContext(payload, state);
  const result = adaptInterface(payload, context, state);
  const interaction = appendInteraction(state, {
    type: 'interface_adaptation',
    summary: `Interface adaptada para ${result.profile.interfaceMode}`,
    contextMode: context.mode,
    pressureScore: context.pressureScore,
  });
  state.interactionMemory = interaction.history;
  state.state.humanAdaptationMode = result.profile.interfaceMode;
  state.state.lastHumanPressureScore = context.pressureScore;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...result, interaction: interaction.item };
}
function getCommunicationScore() {
  const state = ensureQueues(memory.readState());
  const context = analyzeHumanContext({ text: state.lastHumanMessage || '' }, state);
  return scoreCommunication(context, state.interactionMemory || []);
}
function getExperienceHistory() {
  const state = ensureQueues(memory.readState());
  return { ...buildExperienceLedger(state), interactions: listInteractions(state) };
}


function getHumanGoals() {
  const state = ensureQueues(memory.readState());
  const items = buildDefaultHumanGoals(state);
  return { ok: true, items, summary: summarizeHumanGoals(items), version: '3.6.0' };
}
function createHumanGoalNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = addHumanGoal(state, payload);
  state.humanGoals = result.items;
  const ledger = appendExecutiveLedger(state, { type: 'human_goal_created', title: 'Meta humana criada: ' + result.goal.title, summary: 'Score executivo ' + result.goal.score + '/100', impact: result.goal.score >= 80 ? 'high' : 'medium' });
  state.executiveLedger = ledger.history;
  state.state.currentHumanPriority = result.goal.title;
  state.state.executiveAssistantMode = 'active';
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, goal: result.goal, items: result.items, summary: summarizeHumanGoals(result.items), ledger: ledger.item };
}
function getExecutiveToday() {
  const state = ensureQueues(memory.readState());
  const goals = buildDefaultHumanGoals(state);
  return buildExecutiveToday(goals, state);
}
function createExecutivePlanNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const goals = buildDefaultHumanGoals(state);
  const plan = buildExecutivePlan(goals, payload, state);
  const ledger = appendExecutiveLedger(state, { type: 'executive_plan_created', title: 'Plano executivo diário criado', summary: plan.primary ? 'Foco: ' + plan.primary.title : 'Plano criado sem prioridade primária definida.', impact: 'high' });
  state.executiveLedger = ledger.history;
  state.lastExecutivePlan = plan;
  state.state.lastExecutivePlanId = plan.planId;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...plan, ledger: ledger.item };
}
function getFocusAllocation() {
  const state = ensureQueues(memory.readState());
  const goals = buildDefaultHumanGoals(state);
  return allocateFocus(goals, state);
}
function getPriorityCalendar() {
  const state = ensureQueues(memory.readState());
  const goals = buildDefaultHumanGoals(state);
  const focus = allocateFocus(goals, state);
  return buildPriorityCalendar(goals, focus);
}
function getExecutiveLedger() {
  const state = ensureQueues(memory.readState());
  return buildExecutiveLedger(state);
}

function getVendors() {
  const state = ensureQueues(memory.readState());
  return buildVendorRanking(state);
}
function evaluateVendorNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = evaluateVendor(payload, state);
  state.vendorEvaluations = [result, ...(state.vendorEvaluations || [])].slice(0, 25);
  state.state.lastVendorEvaluation = result.decision;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return result;
}
function negotiateExternalNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = startExternalNegotiation(payload, state);
  state.deals = result.deals;
  state.state.lastExternalNegotiation = result.negotiation.target;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return result;
}
function getExternalDeals() {
  const state = ensureQueues(memory.readState());
  return buildDealLedger(state);
}
function getExternalOpportunities() {
  const state = ensureQueues(memory.readState());
  return buildOpportunities(state);
}
function getCommercialIntelligence() {
  const state = ensureQueues(memory.readState());
  return buildCommercialDashboard(state);
}


function getEnterpriseCompanies() {
  const state = memory.readState();
  return buildCompanies(state);
}
function createEnterpriseCompanyNow(payload = {}) {
  const state = memory.readState();
  const created = addCompany(state, payload);
  memory.writeState({ ...state, companies: [...(state.companies || []), created.company] });
  return { ...created, message: 'Empresa registrada no comando central da Megan.' };
}
function getEnterpriseUnits() {
  const state = memory.readState();
  return buildUnits(state);
}
function createEnterpriseUnitNow(payload = {}) {
  const state = memory.readState();
  const created = addUnit(state, payload);
  memory.writeState({ ...state, units: [...(state.units || []), created.unit] });
  return { ...created, message: 'Unidade registrada no comando central da Megan.' };
}
function getCentralCommandDashboard() {
  const state = memory.readState();
  return buildCommandDashboard(buildCompanies(state).companies, buildUnits(state).units);
}
function getEnterpriseBenchmark() {
  const state = memory.readState();
  return buildEnterpriseBenchmark(buildCompanies(state).companies, buildUnits(state).units);
}
function getEnterpriseLedger() {
  return buildEnterpriseLedger(memory.readState());
}

function getCrmLeads() {
  const state = ensureQueues(memory.readState());
  return listLeads(state);
}
function createCrmLeadNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = addLead(state, payload);
  state.crmLeads = result.leads;
  state.state.lastCrmLead = result.lead.name;
  state.state.crmOperatorMode = 'active';
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return result;
}
function getCrmPipeline() {
  const state = ensureQueues(memory.readState());
  return buildPipeline(state);
}
function createCrmFollowupNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = buildFollowupPlan(state, payload);
  state.crmFollowups = [result.action, ...(state.crmFollowups || [])].slice(0, 40);
  state.state.lastCrmFollowup = result.action.title;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...result, actions: buildSalesNextActions(state).actions };
}
function getCrmConversion() {
  const state = ensureQueues(memory.readState());
  return buildConversionIntelligence(state);
}
function getCrmRevenue() {
  const state = ensureQueues(memory.readState());
  return buildRevenueLedger(state);
}
function getCrmSalesActions() {
  const state = ensureQueues(memory.readState());
  return buildSalesNextActions(state);
}

function getTeamStatus() {
  const state = ensureQueues(memory.readState());
  return buildTeamStatus(state);
}
function addTeamMemberNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const member = addTeamMember(state, payload);
  state.teamMembers = [member, ...(state.teamMembers || [])].slice(0, 40);
  const ledger = appendWorkforceLedger(state, { type: 'member_added', title: `Membro adicionado: ${member.name}`, summary: `${member.name} entrou como ${member.role}.` });
  state.workforceLedger = ledger.history;
  state.state.lastTeamEvent = ledger.item.title;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ok: true, version: '3.8.0', member, ledger: ledger.item };
}
function getTeamTasks() {
  const state = ensureQueues(memory.readState());
  return { ok: true, version: '3.8.0', tasks: buildDefaultTasks(state) };
}
function assignTeamTasksNow(payload = {}) {
  const state = ensureQueues(memory.readState());
  const result = distributeTasks(state, payload);
  state.teamAssignments = result.assignments;
  const ledger = appendWorkforceLedger(state, { type: 'tasks_assigned', title: 'Tarefas distribuídas pela Megan', summary: `${result.assignments.length} tarefas atribuídas por perfil e capacidade.` });
  state.workforceLedger = ledger.history;
  state.state.lastTeamAssignment = ledger.item.title;
  state.state.updatedAt = new Date().toISOString();
  memory.writeState(state);
  return { ...result, ledger: ledger.item };
}
function getTeamPerformance() {
  const state = ensureQueues(memory.readState());
  return buildTeamPerformance(state);
}
function getTeamWorkload() {
  const state = ensureQueues(memory.readState());
  return buildWorkload(state);
}
function getTeamLedger() {
  const state = ensureQueues(memory.readState());
  return buildWorkforceLedger(state);
}
function getTeamPriority() {
  const state = ensureQueues(memory.readState());
  return buildTeamPriority(state);
}

module.exports = {
  getEnterpriseCompanies, createEnterpriseCompanyNow, getEnterpriseUnits, createEnterpriseUnitNow, getCentralCommandDashboard, getEnterpriseBenchmark, getEnterpriseLedger,
  getCrmLeads, createCrmLeadNow, getCrmPipeline, createCrmFollowupNow, getCrmConversion, getCrmRevenue, getCrmSalesActions,
  getTeamStatus, addTeamMemberNow, getTeamTasks, assignTeamTasksNow, getTeamPerformance, getTeamWorkload, getTeamLedger, getTeamPriority,
  getHumanGoals, createHumanGoalNow, getExecutiveToday, createExecutivePlanNow, getFocusAllocation, getPriorityCalendar, getExecutiveLedger,
    getVendors, evaluateVendorNow, negotiateExternalNow, getExternalDeals, getExternalOpportunities, getCommercialIntelligence,
  analyzeCurrentHumanContext, getHumanInterfaceProfile, adaptHumanInterface, getCommunicationScore, getExperienceHistory,
  getStrategicIdeas, generateStrategicIdeas, synthesizeStrategicSolution, runStrategicBreakthrough, getInnovationHistory,
  getForecastScenarios, runForecastNow, getProbabilityMatrix, getForecastBestPath, getForecastHistory,
  getMemoryEpisodes, createMemoryEpisode, getLearningNarrative, getLessonsLedger, searchExperienceRecall,
  getOrganismStatus, getOrganismHealth, getUnifiedCognition, getStrategicBalance, proposeSupervisedEvolution, applySupervisedEvolutionNow,
  getEmergencyStatus, triggerEmergencyNow, containEmergencyNow, recoverEmergencyNow, getIncidentLedger, getCrisisMode,
  getInternalConstitution,
  getExceptionRules,
  evaluateConstitutionException,
  getConflictTribunal,
  judgeAutonomyConflict,
  getLegalPrecedents,
  reviewConstitutionalAction,
  getGovernanceStatus,
  getLayeredPolicies,
  getVotingWeights,
  getGovernanceLedger,
  runGovernanceVote,
  getMarketStatus,
  openMarketNow,
  getAuctions,
  runAuctionNow,
  getPriorityBids,
  recalculatePriorityNow,
  getOpportunityAllocation,
  getBrainMarketReputation,
  getResourceStatus,
  rebalanceResourcesNow,
  getBudgetStatus,
  recalculateBudgetNow,
  getEnergyStatus,
  optimizeEnergyNow,
  getEfficiencyLedger,
  getCapabilities,
  expandCapabilitiesNow,
  getGeneratedBrains,
  createBrainNow,
  getAuditReport,
  runAuditNow,
  getGrowthPlan,
  getSelfOptimization,
  getBrainPerformance,
  getBrainRanking,
  getFusionOpportunities,
  getRetirementQueue,
  fuseBrainsNow,
  retireBrainNow,
  rebalanceIntelligenceNow,
  buildDashboard, getStatus, getSystemSnapshot, getHistory, setGoal, setPolicyMode, simulateDecision, runCycle,
  listEvents, listErrors, listRepairs, listIncidents, listApprovals, listImprovements, getDuplicateReport,
  getPerformanceReport, getProjectHealthScore, getLearningSummary, getFragilityRanking, getPriorities,
  getEvolutionPlan, getExecutiveDashboard, getSafePatches, listMissions, createMission, activateMissionById,
  completeMissionById, runDiagnosticsNow, runSafeRepairNow, runSafePatchNow, approveAction, rejectAction, triggerRollback, reportClientError,
  getTimerStatus, startTimer, stopTimer, tickTimer, selectNextMissionNow, applySafePatchNow, getPatchHistory,
  getAdaptiveScores, rankMissionImpactNow, selectBestMissionNow, validateMultiPatchNow, applyMultiPatchNow,
  getCompositeGoals, createCompositeGoal, getPlannerStages, getFutureImpact, getRoadmap, regenerateRoadmap,
  getBrains, getModuleSpecializations, buildDelegation, dispatchDelegationNow,
  getSharedGoals, createSharedGoalNow, getConsensusStatus, decideByConsensus, getCoordinationStatus, executeCoordinatedMission,
};
