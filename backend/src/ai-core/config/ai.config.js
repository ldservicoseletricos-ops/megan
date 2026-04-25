export const AI_CONFIG = {
  systemName: "Megan",
  version: "v6",
  reviewThresholds: {
    highRiskNeedsCritic: true,
    complexTaskNeedsCritic: true,
    minimumComplexResponseLength: 180,
    minimumGeneralResponseLength: 40
  },
  scoringWeights: {
    understanding: 0.2,
    planning: 0.2,
    execution: 0.2,
    communication: 0.15,
    alignment: 0.2,
    safety: 0.05
  },
  evolution: {
    minimumInteractionsForEvolution: 3,
    minimumPatternOccurrences: 2,
    lowScoreThreshold: 0.86,
    criticalScoreThreshold: 0.8,
    warningRateThreshold: 0.35,
    hypothesisApprovalThreshold: 0.76,
    promotionConfidenceThreshold: 0.82,
    maxPromotionsPerCycle: 2,
    maxActiveGoals: 4,
    improvementProposalImpactThreshold: 0.06
  },
  adaptation: {
    minimumInteractionsForProfile: 2,
    profileConfidenceThreshold: 0.62,
    historyWindow: 20,
    maxTopPriorities: 3,
    profileModes: [
      "adaptive_balanced",
      "creative_advisor",
      "technical_operator",
      "strategic_architect",
      "direct_executor",
      "deep_specialist"
    ]
  },
  response: {
    defaultLanguage: "pt-BR"
  }
};
