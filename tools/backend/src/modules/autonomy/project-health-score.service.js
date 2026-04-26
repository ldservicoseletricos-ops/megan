function buildProjectHealthScore({ health, diagnostics, duplicateReport, performanceReport, approvals = [] }) {
  const duplicatePenalty = (duplicateReport?.duplicateCount || 0) * 4;
  const criticalDiagnostics = (diagnostics?.findings || []).filter((item) => item.severity === 'danger').length;
  const warningDiagnostics = (diagnostics?.findings || []).filter((item) => item.severity === 'warning').length;
  const pendingApprovals = approvals.filter((item) => item.status === 'pending').length;

  const architecture = Math.max(42, 86 - duplicatePenalty - criticalDiagnostics * 6);
  const runtime = Math.max(40, (health?.score || 80) - criticalDiagnostics * 8 - warningDiagnostics * 3);
  const autonomy = Math.max(50, 88 - pendingApprovals * 3);
  const performance = performanceReport?.score || 76;
  const consolidation = Math.max(38, 82 - duplicatePenalty);

  const totalScore = Math.round((architecture + runtime + autonomy + performance + consolidation) / 5);

  return {
    ok: true,
    totalScore,
    pillars: [
      { id: 'architecture', label: 'Arquitetura', score: architecture },
      { id: 'runtime', label: 'Runtime', score: runtime },
      { id: 'autonomy', label: 'Autonomia', score: autonomy },
      { id: 'performance', label: 'Performance', score: performance },
      { id: 'consolidation', label: 'Consolidação', score: consolidation },
    ],
    summary: totalScore >= 85
      ? 'Projeto forte, com boa base para evoluir em profundidade.'
      : totalScore >= 70
        ? 'Projeto sólido, mas ainda com duplicações e pontos de consolidação importantes.'
        : 'Projeto viável, porém com necessidade clara de consolidação antes de novas expansões.',
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildProjectHealthScore };
