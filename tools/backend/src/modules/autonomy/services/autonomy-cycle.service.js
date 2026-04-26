const { getActiveGoal } = require('./goal-manager.service');
const { buildPriorities } = require('../priority-engine.service');
const { buildFragilityRanking } = require('../fragility-ranking.service');
const { buildLearningSummary } = require('../learning-engine.service');
const { buildEvolutionPlan } = require('../evolution-plan.service');
const { chooseDecision } = require('./decision-engine.service');
const { calculateRisk } = require('./risk-engine.service');
const { executeDecision } = require('./execution-orchestrator.service');
const { validateExecution } = require('./validation-engine.service');
const { buildRollbackPlan } = require('./rollback-engine.service');
const { getMissionOverview, completeMission } = require('./mission-queue.service');
const { selectNextMission } = require('./mission-selector.service');
const { buildPatchResult } = require('./safe-patch-engine.service');
const { buildMultiFilePatch } = require('./multi-file-patch-engine.service');
const { computeAdaptiveScores } = require('./adaptive-score.service');
const { rankMissionsByImpact } = require('./mission-impact-engine.service');
const { buildDelegationPlan } = require('./delegation-engine.service');

function randomId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function runAutonomyCycle({ memory, dashboardBuilder, performanceBuilder, duplicateBuilder, projectHealthBuilder, improvementBuilder, triggeredBy = 'manual' }) {
  const fullState = memory.readState();
  const dashboard = dashboardBuilder();
  const activeGoal = getActiveGoal(fullState.goals);
  const missionImpactRanking = rankMissionsByImpact(fullState.missions || [], fullState);

  let selection = selectNextMission(fullState.missions || [], fullState);
  if (selection.autoActivated) fullState.missions = selection.missions;

  const activeMission = selection.selected;
  const currentMissionImpact = missionImpactRanking.find((item) => item.mission.id === activeMission?.id)?.impact || { totalScore: 0, blockerRemovalScore: 0 };
  const fragilityRanking = buildFragilityRanking({ duplicateReport: duplicateBuilder(), performanceReport: performanceBuilder(), errors: fullState.errors || [], incidents: fullState.incidents || [] });
  const learningSummary = buildLearningSummary(fullState);
  const priorities = buildPriorities({
    fragilityRanking,
    improvements: improvementBuilder(dashboard.health, dashboard.duplicateReport, dashboard.performanceReport),
    learningSummary,
    projectHealth: projectHealthBuilder({ health: dashboard.health, diagnostics: dashboard.diagnostics, duplicateReport: dashboard.duplicateReport, performanceReport: dashboard.performanceReport, approvals: fullState.approvals || [] }),
  }).priorities;

  const decision = chooseDecision({ activeGoal, priorities, mode: fullState.state.mode, activeMission, approvalBacklog: fullState.approvalBacklog || [] });
  const risk = calculateRisk({ priority: priorities[0]?.priority || activeMission?.priority || 'medium', mode: fullState.state.mode, actionType: decision.actionType });
  const execution = executeDecision({ decision, risk, mode: fullState.state.mode });
  const validation = validateExecution({ execution, risk });
  const rollback = buildRollbackPlan({ decision, execution });
  const evolutionPlan = buildEvolutionPlan({ priorities, projectHealth: dashboard.projectHealth });
  const patchResult = decision.actionType === 'generate_patch_plan'
    ? buildMultiFilePatch({
        state: fullState,
        payload: {
          actionType: 'apply_multi_file_patch',
          title: activeMission ? `Patch multiarquivo • ${activeMission.title}` : 'Patch multiarquivo do núcleo autônomo',
          summary: 'Atualização validada entre backend e frontend com dependências cruzadas checadas.',
          files: [
            { path: 'backend/src/modules/autonomy/autonomy.routes.js', role: 'update' },
            { path: 'backend/src/modules/autonomy/autonomy.controller.js', role: 'update' },
            { path: 'backend/src/modules/autonomy/autonomy.service.js', role: 'update' },
            { path: 'frontend/src/features/autonomy/services/autonomyApi.js', role: 'update' },
            { path: 'frontend/src/features/autonomy/pages/AutonomyCenterPage.jsx', role: 'update' },
            { path: 'frontend/src/features/autonomy/components/AutonomyMultiPatchCard.jsx', role: 'create' },
          ],
        },
        mission: activeMission,
        mode: fullState.state.mode,
      })
    : buildPatchResult({ state: fullState, actionType: decision.actionType === 'apply_safe_local_patch' ? 'apply_safe_local_patch' : 'update_autonomy_state', mission: activeMission, mode: fullState.state.mode });

  let nextState = patchResult.state || fullState;
  const historyEntry = { id: `cycle-${Date.now()}`, type: 'autonomy_cycle', triggeredBy, missionId: activeMission?.id || null, goalId: activeGoal?.id || null, decision, missionImpact: currentMissionImpact, risk, execution, validation, rollback, patch: patchResult.patch || null, createdAt: new Date().toISOString() };

  if (activeMission) {
    nextState.missions = (nextState.missions || []).map((mission) => mission.id === activeMission.id ? { ...mission, progress: Math.min(100, (mission.progress || 0) + (validation.approved ? 14 : 4)), updatedAt: new Date().toISOString() } : mission);
    const progressedMission = (nextState.missions || []).find((mission) => mission.id === activeMission.id);
    if (progressedMission && progressedMission.progress >= 100) {
      nextState.missions = completeMission(nextState.missions || [], activeMission.id);
      selection = selectNextMission(nextState.missions || [], nextState);
      if (selection.autoActivated) nextState.missions = selection.missions;
    }
  }

  if (execution.status === 'validation_required') {
    nextState.approvalBacklog = [{ id: randomId('apr'), title: decision.title, actionType: decision.actionType, status: 'pending', priority: risk.level === 'high' ? 'high' : 'medium', reason: validation.summary, createdAt: new Date().toISOString() }, ...(nextState.approvalBacklog || [])].slice(0, 20);
  }
  if (!validation.approved || execution.status === 'blocked') {
    nextState.rollbackQueue = [{ id: randomId('rbq'), decisionId: decision.id, title: rollback.summary, targetAction: decision.actionType, status: 'ready', createdAt: new Date().toISOString() }, ...(nextState.rollbackQueue || [])].slice(0, 20);
  }

  const delegation = buildDelegationPlan({ mission: selection.selected || activeMission || {}, state: nextState });
  const adaptiveScores = computeAdaptiveScores({ current: nextState.state, validation, risk, missionImpact: currentMissionImpact, patch: patchResult.patch, execution });
  nextState.history = [{ ...historyEntry, delegation }, ...(nextState.history || [])].slice(0, 60);
  nextState.delegationHistory = [{ id: `dlg-${Date.now()}`, missionId: (selection.selected || activeMission)?.id || null, primaryBrain: delegation.primaryBrain?.id || null, supportBrains: (delegation.supportBrains || []).map((item) => item.id), createdAt: new Date().toISOString() }, ...(nextState.delegationHistory || [])].slice(0, 40);
  nextState.missionImpactHistory = [{ id: `impact-${Date.now()}`, activeMissionId: activeMission?.id || null, ranking: missionImpactRanking.slice(0, 6).map((item) => ({ missionId: item.mission.id, title: item.mission.title, totalScore: item.impact.totalScore })), createdAt: new Date().toISOString() }, ...(nextState.missionImpactHistory || [])].slice(0, 40);
  nextState.state = {
    ...nextState.state,
    currentPriority: priorities[0]?.id || nextState.state.currentPriority,
    currentPriorityLabel: priorities[0]?.title || nextState.state.currentPriorityLabel,
    currentMission: selection.selected?.title || activeMission?.title || nextState.state.currentMission,
    currentMissionId: selection.selected?.id || activeMission?.id || nextState.state.currentMissionId,
    nextMissionSuggestion: selection.selected || null,
    lastAutoSelection: selection.autoActivated ? { missionId: selection.selected?.id || null, title: selection.selected?.title || null, reason: selection.reason, createdAt: new Date().toISOString() } : nextState.state.lastAutoSelection,
    lastDecision: decision,
    lastExecution: execution,
    lastValidation: validation,
    autonomyScore: adaptiveScores.autonomy,
    maturityScore: adaptiveScores.maturity,
    stabilityScore: adaptiveScores.stability,
    assertivenessScore: adaptiveScores.assertiveness,
    operationalRiskScore: adaptiveScores.operationalRisk,
    resolutionVelocityScore: adaptiveScores.resolutionVelocity,
    coordinationScore: Math.min(100, Number(nextState.state.coordinationScore || 58) + (delegation.primaryBrain ? 2 : 0)),
    activeBrain: delegation.primaryBrain?.id || nextState.state.activeBrain,
    riskLevel: risk.level,
    lastPatch: patchResult.patch || nextState.state.lastPatch,
    lastPatchStatus: patchResult.patch?.status || nextState.state.lastPatchStatus,
    lastMultiPatch: patchResult.patch?.kind === 'multi_file' ? patchResult.patch : nextState.state.lastMultiPatch,
    lastMultiPatchStatus: patchResult.patch?.kind === 'multi_file' ? patchResult.patch.status : nextState.state.lastMultiPatchStatus,
    lastTimerRunAt: triggeredBy === 'timer' ? new Date().toISOString() : nextState.state.lastTimerRunAt,
    updatedAt: new Date().toISOString(),
  };
  nextState.lastDiagnosticAt = new Date().toISOString();
  memory.writeState(nextState);
  return { ok: true, state: nextState.state, activeGoal, activeMission: selection.selected || activeMission, missions: getMissionOverview(nextState.missions || []), missionImpactRanking, priorities, decision, risk, execution, validation, rollback, patch: patchResult.patch || null, evolutionPlan, historyEntry, approvalBacklog: nextState.approvalBacklog || [], rollbackQueue: nextState.rollbackQueue || [], timerTriggered: triggeredBy === 'timer' };
}

module.exports = { runAutonomyCycle };
