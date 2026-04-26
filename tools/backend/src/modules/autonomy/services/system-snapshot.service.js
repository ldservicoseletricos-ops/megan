const { getMissionOverview } = require('./mission-queue.service');

function buildSystemSnapshot({ dashboard, activeGoal, state, policies, missions = [], approvalBacklog = [], rollbackQueue = [], strategic = {}, brains = [], moduleSpecializations = [], delegation = null, delegationHistory = [], market = null, auctions = null, priorityBids = null, opportunityAllocation = null }) {
  const missionOverview = getMissionOverview(missions);
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    mission: state.currentMission,
    goal: activeGoal,
    missionQueue: missionOverview,
    mode: state.mode,
    activeBrain: state.activeBrain,
    riskLevel: state.riskLevel,
    timer: {
      running: Boolean(state.timerEnabled && state.continuousMode),
      intervalMs: Number(state.timerIntervalMs || 30000),
      continuousMode: Boolean(state.continuousMode),
      lastTimerRunAt: state.lastTimerRunAt || null,
    },
    patch: {
      lastPatch: state.lastPatch || null,
      lastPatchStatus: state.lastPatchStatus || null,
      lastMultiPatch: state.lastMultiPatch || null,
      lastMultiPatchStatus: state.lastMultiPatchStatus || null,
    },
    scores: {
      autonomy: state.autonomyScore,
      stability: state.stabilityScore,
      maturity: state.maturityScore,
      assertiveness: state.assertivenessScore || 0,
      operationalRisk: state.operationalRiskScore || 0,
      resolutionVelocity: state.resolutionVelocityScore || 0,
      coordination: state.coordinationScore || 0,
      projectHealth: dashboard.projectHealth?.totalScore || dashboard.summary?.score || 0,
    },
    modules: [
      { id: 'autonomy', label: 'Autonomy Core', status: 'online' },
      { id: 'crm', label: 'CRM', status: 'available' },
      { id: 'navigation', label: 'Navigation', status: 'available' },
      { id: 'health', label: 'Health', status: 'available' },
    ],
    runtime: {
      openErrors: dashboard.summary?.openErrors || 0,
      pendingApprovals: dashboard.summary?.pendingApprovals || 0,
      queuedMissions: missionOverview.queued.length,
      rollbackReady: rollbackQueue.filter((item) => item.status === 'ready').length,
      improvementBacklog: dashboard.summary?.improvementBacklog || 0,
      duplicateCount: dashboard.summary?.duplicateCount || 0,
    },
    approvalBacklog,
    rollbackQueue,
    missionImpactRanking: dashboard.missionImpactRanking || [],
    brains,
    moduleSpecializations,
    delegation,
    delegationHistory,
    market,
    auctions,
    priorityBids,
    opportunityAllocation,

strategic: {
  compositeGoals: strategic.compositeGoals || [],
  stages: strategic.stages || [],
  futureImpact: strategic.futureImpact || null,
  roadmap: strategic.roadmap || [],
  priorities: strategic.priorities || null,
},
    policySummary: {
      mode: policies.currentMode,
      automatic: (policies.allowedWithoutApproval || []).length,
      validated: (policies.allowedWithValidation || []).length,
      blocked: (policies.blockedWithoutExplicitApproval || []).length,
    },
  };
}

module.exports = { buildSystemSnapshot };
