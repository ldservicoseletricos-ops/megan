function buildAuditReport(state = {}) {
  const issues = [
    { id: 'audit-1', area: 'frontend', severity: 'medium', title: 'Dependências precisam reinstalação limpa em ambientes novos', recommendation: 'Executar instalação limpa do Vite antes do build.' },
    { id: 'audit-2', area: 'autonomy', severity: 'low', title: 'Fila de missões pode crescer sem expurgo', recommendation: 'Arquivar itens concluídos antigos automaticamente.' },
    { id: 'audit-3', area: 'brains', severity: 'medium', title: 'Necessidade de especialista de deploy', recommendation: 'Criar brain dedicado a deploy e observabilidade.' },
  ];
  const score = Math.max(52, 84 - issues.length * 7);
  return {
    ok: true,
    score,
    status: score >= 75 ? 'healthy' : 'attention',
    issues,
    summary: {
      critical: issues.filter((i) => i.severity === 'critical').length,
      medium: issues.filter((i) => i.severity === 'medium').length,
      low: issues.filter((i) => i.severity === 'low').length,
    },
    generatedAt: new Date().toISOString(),
  };
}

function runAudit(state = {}) {
  const report = buildAuditReport(state);
  state.auditReports = [report, ...((state.auditReports)||[])].slice(0, 30);
  state.state.auditScore = report.score;
  state.state.updatedAt = new Date().toISOString();
  return { ok: true, state, report };
}

module.exports = { buildAuditReport, runAudit };
