export function buildEvolutionMemoryEntry({ diagnostics, goals, proposals, promotions, runStatus }) {
  const bestProposal = [...proposals].sort((a, b) => (b.expectedImpact || 0) - (a.expectedImpact || 0))[0] || null;

  return {
    type: "phase5_evolution_cycle",
    status: runStatus,
    summary: {
      averageScore: diagnostics.averageScore || 0,
      lowScoreRate: diagnostics.lowScoreRate || 0,
      warningRate: diagnostics.warningRate || 0,
      goalsTracked: goals.length,
      proposalsCreated: proposals.length,
      promotions: promotions.length
    },
    bestProposal: bestProposal
      ? {
          title: bestProposal.title,
          goalSlug: bestProposal.goalSlug,
          expectedImpact: bestProposal.expectedImpact,
          candidateProfile: bestProposal.candidateProfile
        }
      : null,
    promotedProfiles: promotions.map((item) => item.newActiveProfile)
  };
}
