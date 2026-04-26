import { AI_CONFIG } from "../config/ai.config.js";

function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

function getConfidence(item) {
  const signalStrength = Object.values(item.signals || {}).reduce((acc, value) => acc + (Number(value) || 0), 0);
  const normalizedSignal = Math.min(1, signalStrength / Math.max(1, Object.keys(item.signals || {}).length || 1));
  const riskPenalty = item.risk === "medium" ? 0.06 : item.risk === "high" ? 0.12 : 0.02;

  return round(Math.max(0.5, Math.min(0.97, 0.68 + normalizedSignal * 0.24 - riskPenalty)));
}

function getExpectedImprovement(item, diagnostics) {
  const base = (1 - (diagnostics.averageScore || 0.7)) * 0.15;
  const urgencyBoost = (diagnostics.lowScoreRate || 0) * 0.1 + (diagnostics.warningRate || 0) * 0.08;
  const riskPenalty = item.risk === "medium" ? 0.02 : item.risk === "high" ? 0.05 : 0.01;

  return round(Math.max(0.03, base + urgencyBoost - riskPenalty));
}

export function runExperiments({ hypotheses, diagnostics, systemState, proposals = [] }) {
  return hypotheses.map((item) => {
    const confidence = getConfidence(item);
    const expectedImprovement = getExpectedImprovement(item, diagnostics);
    const linkedProposal = proposals.find((proposal) => proposal.basedOnHypothesis === item.name || proposal.candidateProfile === item.candidateVersion);
    const approved = confidence >= AI_CONFIG.evolution.hypothesisApprovalThreshold;

    return {
      name: item.name,
      hypothesis: item.hypothesis,
      reason: item.reason,
      baselineVersion: systemState.activeProfile || "v5-baseline",
      candidateVersion: item.candidateVersion,
      baselineMetrics: {
        averageScore: round(diagnostics.averageScore),
        lowScoreRate: round(diagnostics.lowScoreRate),
        warningRate: round(diagnostics.warningRate)
      },
      metrics: {
        expectedImprovement,
        confidence,
        expectedTargets: item.expectedTargets || [],
        linkedExpectedImpact: linkedProposal?.expectedImpact || 0
      },
      linkedGoalSlug: linkedProposal?.goalSlug || null,
      linkedProposalTitle: linkedProposal?.title || null,
      signals: item.signals || {},
      risk: item.risk || "low",
      status: approved ? "approved_for_trial" : "rejected_for_now"
    };
  });
}
