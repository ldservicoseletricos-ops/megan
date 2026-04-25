const priorityWeight = { critical: 40, high: 28, medium: 16, low: 8 };

function scoreMissionImpact(mission = {}, state = {}) {
  const urgency = priorityWeight[mission.priority] || 10;
  const blockerRemovalScore = mission.blocker ? 18 : 0;
  const progressGap = Math.max(0, 100 - Number(mission.progress || 0));
  const dependencyScore = Math.max(0, 10 - ((mission.dependencies || []).length * 2));
  const ownerBoost = mission.owner === 'autonomy' ? 6 : 2;
  const modeBoost = state?.state?.mode === 'continuous_autonomy' ? 6 : 2;
  const summary = `${mission.summary || ''} ${mission.title || ''}`.toLowerCase();
  const technicalBenefitScore = /auth|backend|patch|stability|autonomy|integr/.test(summary) ? 14 : 8;
  const visualBenefitScore = /ui|painel|card|visual|frontend/.test(summary) ? 8 : 3;
  const riskReductionScore = /stability|erro|falha|risk|rollback|repair/.test(summary) ? 14 : 6;
  const totalScore = urgency + blockerRemovalScore + Math.round(progressGap / 7) + dependencyScore + ownerBoost + modeBoost + technicalBenefitScore + visualBenefitScore + riskReductionScore;
  return { missionId: mission.id, title: mission.title, urgencyScore: urgency, blockerRemovalScore, technicalBenefitScore, visualBenefitScore, riskReductionScore, dependencyScore, totalScore, rationale: totalScore >= 85 ? 'Impacto muito alto no destravamento da evolução.' : totalScore >= 60 ? 'Impacto alto com boa relação entre urgência e redução de risco.' : 'Impacto moderado; útil, mas não é a missão mais transformadora do momento.' };
}

function rankMissionsByImpact(missions = [], state = {}) {
  return [...missions].filter((mission) => mission.status !== 'completed').map((mission) => ({ mission, impact: scoreMissionImpact(mission, state) })).sort((a, b) => b.impact.totalScore - a.impact.totalScore);
}

module.exports = { scoreMissionImpact, rankMissionsByImpact };
