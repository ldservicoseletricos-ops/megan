function buildConflictTribunal(state = {}) {
  const history = state.tribunalHistory || [];
  return {
    ok: true,
    status: 'available',
    openCases: history.filter((item) => item.status === 'open'),
    recentVerdicts: history.filter((item) => item.status === 'resolved').slice(0, 10),
    judges: [
      { id: 'stability-judge', role: 'Estabilidade', voteWeight: 34 },
      { id: 'strategy-judge', role: 'Estratégia', voteWeight: 26 },
      { id: 'risk-judge', role: 'Risco', voteWeight: 24 },
      { id: 'execution-judge', role: 'Execução', voteWeight: 16 },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function judgeConflict(payload = {}, state = {}) {
  const severity = payload.severity || 'medium';
  const verdict = severity === 'critical' ? 'escalate_to_consensus' : 'approve_lowest_risk_path';
  const entry = {
    id: `tribunal-${Date.now()}`,
    title: payload.title || 'Conflito interno entre decisões',
    conflictType: payload.conflictType || 'priority_dispute',
    severity,
    verdict,
    status: 'resolved',
    rationale: verdict === 'escalate_to_consensus'
      ? 'Conflito crítico exige consenso antes de execução.'
      : 'Conflito resolvido pela rota de menor risco e maior reversibilidade.',
    createdAt: new Date().toISOString(),
  };
  const nextState = { ...state, tribunalHistory: [entry, ...(state.tribunalHistory || [])].slice(0, 50) };
  return { ok: true, verdict: entry, state: nextState };
}

module.exports = { buildConflictTribunal, judgeConflict };
