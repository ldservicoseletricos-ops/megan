import { getJson, postJson } from '../../../lib/api';

export function getAutonomyStatus() { return getJson('/api/autonomy/status'); }
export function getAutonomySnapshot() { return getJson('/api/autonomy/snapshot'); }
export function getAutonomyHistory() { return getJson('/api/autonomy/history'); }
export function getAutonomyDashboard() { return getJson('/api/autonomy/dashboard'); }
export function getAutonomyMissions() { return getJson('/api/autonomy/missions'); }
export function runAutonomyCycle() { return postJson('/api/autonomy/cycle/run', {}); }
export function runAutonomyDiagnostics() { return postJson('/api/autonomy/run-diagnostics', {}); }
export function runAutonomyRepair(actionType = 'fallback_safe_mode') { return postJson('/api/autonomy/run-safe-repair', { actionType }); }
export function simulateAutonomyDecision(actionType) { return postJson('/api/autonomy/decision/simulate', actionType ? { actionType } : {}); }
export function setAutonomyGoal(payload) { return postJson('/api/autonomy/goal', payload); }
export function setAutonomyMode(mode) { return postJson('/api/autonomy/policy/mode', { mode }); }
export function createAutonomyMission(payload) { return postJson('/api/autonomy/missions', payload); }
export function activateAutonomyMission(missionId) { return postJson('/api/autonomy/missions/activate', { missionId }); }
export function completeAutonomyMission(missionId) { return postJson('/api/autonomy/missions/complete', { missionId }); }
export function approveAutonomyAction(approvalId) { return postJson('/api/autonomy/approve-action', { approvalId }); }
export function rejectAutonomyAction(approvalId) { return postJson('/api/autonomy/reject-action', { approvalId }); }
export function runAutonomyRollback(rollbackId) { return postJson('/api/autonomy/rollback/run', { rollbackId }); }

export function getAutonomyTimerStatus() { return getJson('/api/autonomy/timer/status'); }
export function startAutonomyTimer() { return postJson('/api/autonomy/timer/start', {}); }
export function stopAutonomyTimer() { return postJson('/api/autonomy/timer/stop', {}); }
export function tickAutonomyTimer() { return postJson('/api/autonomy/timer/tick', {}); }
export function selectNextAutonomyMission() { return postJson('/api/autonomy/missions/select-next', {}); }
export function applyAutonomySafePatch(actionType) { return postJson('/api/autonomy/patch/apply-safe', { actionType }); }
export function getAutonomyPatchHistory() { return getJson('/api/autonomy/patch/history'); }

export function getAutonomyAdaptiveScores() { return getJson('/api/autonomy/scores/adaptive'); }
export function rankAutonomyMissionImpact() { return postJson('/api/autonomy/missions/rank-impact', {}); }
export function selectBestAutonomyMission() { return postJson('/api/autonomy/missions/select-best', {}); }
export function validateAutonomyMultiPatch(files) { return postJson('/api/autonomy/patch/validate', { files }); }
export function applyAutonomyMultiPatch(payload) { return postJson('/api/autonomy/patch/apply-multi', payload || {}); }

export function getAutonomyCompositeGoals() { return getJson('/api/autonomy/goals/composite'); }
export function createAutonomyCompositeGoal(payload) { return postJson('/api/autonomy/goals/composite', payload); }
export function getAutonomyPlannerStages() { return getJson('/api/autonomy/planner/stages'); }
export function getAutonomyFutureImpact() { return getJson('/api/autonomy/impact/future'); }
export function getAutonomyRoadmap() { return getJson('/api/autonomy/roadmap'); }
export function regenerateAutonomyRoadmap() { return postJson('/api/autonomy/roadmap/regenerate', {}); }

export function getAutonomyBrains() { return getJson('/api/autonomy/brains'); }
export function getAutonomyModuleSpecializations() { return getJson('/api/autonomy/modules/specialization'); }
export function getAutonomyDelegationPlan(payload) { return postJson('/api/autonomy/delegation/plan', payload || {}); }
export function dispatchAutonomyDelegation(payload) { return postJson('/api/autonomy/delegation/dispatch', payload || {}); }

export function getAutonomySharedGoals() { return getJson('/api/autonomy/shared-goals'); }
export function createAutonomySharedGoal(payload) { return postJson('/api/autonomy/shared-goals', payload || {}); }
export function getAutonomyConsensusStatus() { return getJson('/api/autonomy/consensus/status'); }
export function decideAutonomyConsensus(payload) { return postJson('/api/autonomy/consensus/decide', payload || {}); }
export function getAutonomyCoordinationStatus() { return getJson('/api/autonomy/coordination/status'); }
export function executeAutonomyCoordination(payload) { return postJson('/api/autonomy/coordination/execute', payload || {}); }

export function getAutonomyCapabilities() { return getJson('/api/autonomy/capabilities'); }
export function expandAutonomyCapabilities(payload) { return postJson('/api/autonomy/capabilities/expand', payload || {}); }
export function createAutonomyBrain(payload) { return postJson('/api/autonomy/brains/create', payload || {}); }
export function getAutonomyGeneratedBrains() { return getJson('/api/autonomy/brains/generated'); }
export function getAutonomyAuditReport() { return getJson('/api/autonomy/audit/report'); }
export function runAutonomyAudit() { return postJson('/api/autonomy/audit/run', {}); }
export function getAutonomyGrowthPlan() { return getJson('/api/autonomy/growth/plan'); }
export function getAutonomySelfOptimization() { return getJson('/api/autonomy/self-optimization'); }

export function getAutonomyBrainPerformance() { return getJson('/api/autonomy/brains/performance'); }
export function getAutonomyBrainRanking() { return getJson('/api/autonomy/brains/ranking'); }
export function getAutonomyFusionOpportunities() { return getJson('/api/autonomy/brains/fusion-opportunities'); }
export function getAutonomyRetirementQueue() { return getJson('/api/autonomy/brains/retirement-queue'); }
export function fuseAutonomyBrains(payload) { return postJson('/api/autonomy/brains/fuse', payload || {}); }
export function retireAutonomyBrain(payload) { return postJson('/api/autonomy/brains/retire', payload || {}); }
export function rebalanceAutonomyIntelligence() { return postJson('/api/autonomy/intelligence/rebalance', {}); }

export function getAutonomyResourceStatus() { return getJson('/api/autonomy/resources/status'); }
export function rebalanceAutonomyResources() { return postJson('/api/autonomy/resources/rebalance', {}); }
export function getAutonomyBudgetStatus() { return getJson('/api/autonomy/budget/status'); }
export function recalculateAutonomyBudget() { return postJson('/api/autonomy/budget/recalculate', {}); }
export function getAutonomyEnergyStatus() { return getJson('/api/autonomy/energy/status'); }
export function optimizeAutonomyEnergy() { return postJson('/api/autonomy/energy/optimize', {}); }

export function getAutonomyMarketStatus() { return getJson('/api/autonomy/market/status'); }
export function openAutonomyMarket() { return postJson('/api/autonomy/market/open', {}); }
export function getAutonomyMarketReputation() { return getJson('/api/autonomy/market/reputation'); }
export function getAutonomyAuctions() { return getJson('/api/autonomy/auctions'); }
export function runAutonomyAuction(payload) { return postJson('/api/autonomy/auctions/run', payload || {}); }
export function getAutonomyPriorityBids() { return getJson('/api/autonomy/priority/bids'); }
export function recalculateAutonomyPriority() { return postJson('/api/autonomy/priority/recalculate', {}); }
export function getAutonomyOpportunityAllocation() { return getJson('/api/autonomy/opportunity/allocation'); }

export function getAutonomyGovernanceStatus() { return getJson('/api/autonomy/governance/status'); }
export function getAutonomyLayeredPolicies() { return getJson('/api/autonomy/governance/policies'); }
export function getAutonomyVotingWeights(context = 'balanced') { return getJson(`/api/autonomy/governance/voting-weights?context=${encodeURIComponent(context)}`); }
export function getAutonomyGovernanceLedger() { return getJson('/api/autonomy/governance/ledger'); }
export function runAutonomyGovernanceVote(payload) { return postJson('/api/autonomy/governance/vote', payload || {}); }

export function getAutonomyConstitution() { return getJson('/api/autonomy/constitution'); }
export function getAutonomyExceptionRules() { return getJson('/api/autonomy/exceptions/rules'); }
export function evaluateAutonomyException(payload) { return postJson('/api/autonomy/exceptions/evaluate', payload || {}); }
export function getAutonomyTribunalStatus() { return getJson('/api/autonomy/tribunal/status'); }
export function judgeAutonomyConflict(payload) { return postJson('/api/autonomy/tribunal/judge', payload || {}); }
export function getAutonomyPrecedents() { return getJson('/api/autonomy/precedents'); }
export function reviewAutonomyConstitution(payload) { return postJson('/api/autonomy/constitution/review', payload || {}); }

export function getAutonomyEpisodes() { return getJson('/api/autonomy/memory/episodes'); }
export function createAutonomyEpisode(payload) { return postJson('/api/autonomy/memory/episodes', payload || {}); }
export function getAutonomyNarrative() { return getJson('/api/autonomy/narrative'); }
export function getAutonomyLessons() { return getJson('/api/autonomy/lessons'); }
export function searchAutonomyRecall(payload) { return postJson('/api/autonomy/recall/search', payload || {}); }

export function getAutonomyForecastScenarios() { return getJson('/api/autonomy/forecast/scenarios'); }
export function runAutonomyForecast(payload) { return postJson('/api/autonomy/forecast/run', payload || {}); }
export function getAutonomyProbability() { return getJson('/api/autonomy/probability'); }
export function getAutonomyForecastBestPath() { return getJson('/api/autonomy/forecast/best-path'); }
export function getAutonomyForecastHistory() { return getJson('/api/autonomy/forecast/history'); }


export function getAutonomyIdeas() { return getJson('/api/autonomy/ideas'); }
export function generateAutonomyIdeas(payload) { return postJson('/api/autonomy/ideas/generate', payload || {}); }
export function synthesizeAutonomySolution(payload) { return postJson('/api/autonomy/solutions/synthesize', payload || {}); }
export function runAutonomyBreakthrough(payload) { return postJson('/api/autonomy/breakthrough/run', payload || {}); }
export function getAutonomyInnovationHistory() { return getJson('/api/autonomy/innovation/history'); }


export function analyzeAutonomyHumanContext(payload) { return postJson('/api/autonomy/context/analyze', payload || {}); }
export function getAutonomyInterfaceProfile() { return getJson('/api/autonomy/interface/profile'); }
export function adaptAutonomyInterface(payload) { return postJson('/api/autonomy/interface/adapt', payload || {}); }
export function getAutonomyCommunicationScore() { return getJson('/api/autonomy/communication/score'); }
export function getAutonomyExperienceHistory() { return getJson('/api/autonomy/experience/history'); }

export function getAutonomyVendors() { return getJson('/api/autonomy/vendors'); }
export function evaluateAutonomyVendor(payload) { return postJson('/api/autonomy/vendors/evaluate', payload || {}); }
export function startAutonomyExternalNegotiation(payload) { return postJson('/api/autonomy/negotiation/external', payload || {}); }
export function getAutonomyDeals() { return getJson('/api/autonomy/deals'); }
export function getAutonomyOpportunities() { return getJson('/api/autonomy/opportunities'); }
export function getAutonomyCommercialIntelligence() { return getJson('/api/autonomy/commercial/intelligence'); }

export function getAutonomyHumanGoals() { return getJson('/api/autonomy/goals/human'); }
export function createAutonomyHumanGoal(payload) { return postJson('/api/autonomy/goals/human', payload || {}); }
export function getAutonomyExecutiveToday() { return getJson('/api/autonomy/executive/today'); }
export function createAutonomyExecutivePlan(payload) { return postJson('/api/autonomy/executive/plan', payload || {}); }
export function getAutonomyFocus() { return getJson('/api/autonomy/focus'); }
export function getAutonomyPriorityCalendar() { return getJson('/api/autonomy/calendar/priorities'); }
export function getAutonomyExecutiveLedger() { return getJson('/api/autonomy/executive/ledger'); }

export function getAutonomyTeamStatus() { return getJson('/api/autonomy/team/status'); }
export function addAutonomyTeamMember(payload) { return postJson('/api/autonomy/team/member', payload || {}); }
export function getAutonomyTeamTasks() { return getJson('/api/autonomy/team/tasks'); }
export function assignAutonomyTeamTasks(payload) { return postJson('/api/autonomy/team/assign', payload || {}); }
export function getAutonomyTeamPerformance() { return getJson('/api/autonomy/team/performance'); }
export function getAutonomyTeamWorkload() { return getJson('/api/autonomy/team/workload'); }
export function getAutonomyTeamLedger() { return getJson('/api/autonomy/team/ledger'); }
export function getAutonomyTeamPriorities() { return getJson('/api/autonomy/team/priorities'); }


export function getAutonomyCrmLeads() { return getJson('/api/autonomy/crm/leads'); }
export function createAutonomyCrmLead(payload) { return postJson('/api/autonomy/crm/lead', payload || {}); }
export function getAutonomyCrmPipeline() { return getJson('/api/autonomy/crm/pipeline'); }
export function createAutonomyCrmFollowup(payload) { return postJson('/api/autonomy/crm/followup', payload || {}); }
export function getAutonomyCrmConversion() { return getJson('/api/autonomy/crm/conversion'); }
export function getAutonomyCrmRevenue() { return getJson('/api/autonomy/crm/revenue'); }
export function getAutonomyCrmActions() { return getJson('/api/autonomy/crm/actions'); }
