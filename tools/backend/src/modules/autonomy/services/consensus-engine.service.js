const { buildBrains } = require('./brain-registry.service');

function buildConsensus({ state = {}, mission = null, candidateAction = null } = {}) {
  const brains = buildBrains(state);
  const title = candidateAction?.title || candidateAction?.actionType || mission?.title || 'ação estratégica';
  const missionText = `${mission?.title || ''} ${mission?.summary || ''} ${candidateAction?.summary || ''}`.toLowerCase();
  const ballots = brains.map((brain) => {
    const preferenceMatch = (brain.preferredMissionTypes || []).some((type) => missionText.includes(String(type).toLowerCase()));
    const supportScore = Math.max(48, Math.min(98, Math.round((brain.autonomyLevel || 70) * 0.55 + (100 - (brain.load || 40)) * 0.25 + (preferenceMatch ? 16 : 5))));
    return {
      brainId: brain.id,
      label: brain.label,
      vote: supportScore >= 64 ? 'approve' : 'review',
      supportScore,
      rationale: preferenceMatch
        ? `${brain.label} reconhece alinhamento direto com a ação proposta.`
        : `${brain.label} aceita a ação pelo equilíbrio entre autonomia, carga e segurança.`,
    };
  });
  const averageSupport = ballots.length ? Math.round(ballots.reduce((acc, item) => acc + item.supportScore, 0) / ballots.length) : 0;
  const approvals = ballots.filter((item) => item.vote === 'approve').length;
  const consensusLevel = approvals >= Math.ceil(ballots.length * 0.75) ? 'strong' : approvals >= Math.ceil(ballots.length * 0.5) ? 'moderate' : 'weak';
  return {
    ok: true,
    action: title,
    missionId: mission?.id || null,
    ballots,
    summary: `${approvals}/${ballots.length || 0} cérebros aprovaram a ação ${title}.`,
    averageSupport,
    approvalRate: ballots.length ? Math.round((approvals / ballots.length) * 100) : 0,
    consensusLevel,
    approved: consensusLevel !== 'weak',
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildConsensus };
