import { AI_CONFIG } from "../config/ai.config.js";

export function promoteApprovedExperiments({ experiments, diagnostics, proposals = [] }) {
  const approved = experiments.filter((item) => {
    const confidence = item.metrics?.confidence || 0;
    const improvement = item.metrics?.expectedImprovement || 0;
    const linkedProposal = proposals.find((proposal) => proposal.goalSlug === item.linkedGoalSlug);

    return (
      item.status === "approved_for_trial" &&
      confidence >= AI_CONFIG.evolution.promotionConfidenceThreshold &&
      improvement >= 0.07 &&
      ((linkedProposal?.expectedImpact || 0) >= AI_CONFIG.evolution.improvementProposalImpactThreshold || !linkedProposal)
    );
  });

  const selected = approved.slice(0, AI_CONFIG.evolution.maxPromotionsPerCycle);

  return selected.map((item) => ({
    name: item.name,
    promoted: true,
    linkedGoalSlug: item.linkedGoalSlug || null,
    newActiveProfile: item.candidateVersion,
    confidence: item.metrics?.confidence || 0,
    expectedImprovement: item.metrics?.expectedImprovement || 0,
    reason: `Promovido com confiança ${(item.metrics?.confidence || 0).toFixed(2)} e melhoria esperada ${(item.metrics?.expectedImprovement || 0).toFixed(2)} sobre score médio ${(diagnostics.averageScore || 0).toFixed(2)}.`
  }));
}
