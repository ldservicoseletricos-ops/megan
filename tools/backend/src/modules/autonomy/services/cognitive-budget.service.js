function buildBudgetStatus(state = {}) {
  const missionCount = (state.missions || []).length;
  const pending = (state.approvalBacklog || []).filter((item) => item.status === 'pending').length;
  return {
    ok: true,
    cycleDecisionLimit: Number((state.cognitiveBudget || {}).cycleDecisionLimit || Math.max(4, Math.min(12, 4 + Math.round(missionCount / 2) + pending))),
    deepAnalysisLimit: Number((state.cognitiveBudget || {}).deepAnalysisLimit || 3),
    activeBrainLimit: Number((state.cognitiveBudget || {}).activeBrainLimit || 4),
    executionBudget: Number((state.cognitiveBudget || {}).executionBudget || 100),
    reserveBudget: Number((state.cognitiveBudget || {}).reserveBudget || 22),
    pressure: pending > 2 ? 'high' : missionCount > 3 ? 'medium' : 'stable',
    updatedAt: new Date().toISOString(),
  };
}
function recalculateBudget(state = {}) { const budget = buildBudgetStatus(state); state.cognitiveBudget = budget; return { state, budget }; }
module.exports = { buildBudgetStatus, recalculateBudget };
