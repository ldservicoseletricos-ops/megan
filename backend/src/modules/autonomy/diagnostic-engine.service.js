function severityFromStatus(status) {
  if (status === 'offline' || status === 'missing') return 'danger';
  if (status === 'standby') return 'warning';
  return 'info';
}

function buildDiagnostics(healthOverview) {
  const findings = [];

  for (const moduleItem of healthOverview.modules) {
    if (moduleItem.status !== 'online') {
      findings.push({
        id: `diag-${moduleItem.id}`,
        title: `${moduleItem.label} em ${moduleItem.status}`,
        probableCause: moduleItem.status === 'standby'
          ? 'Módulo mantido apenas como referência após fusão/consolidação.'
          : 'Estrutura do módulo não encontrada ou indisponível.',
        recommendation: moduleItem.status === 'standby'
          ? 'Planejar desativação guiada ou absorção final para reduzir duplicação.'
          : 'Verificar estrutura, dependências e startup do módulo.',
        severity: severityFromStatus(moduleItem.status),
        affectedArea: moduleItem.id,
      });
    }
  }

  findings.push({
    id: 'diag-autonomy-core',
    title: 'Autonomy Core pronto para fase supervisionada',
    probableCause: 'Estrutura base de monitoramento e memória operacional já foi ativada.',
    recommendation: 'Rodar diagnósticos antes de novas evoluções e usar reparo seguro para falhas reversíveis.',
    severity: 'info',
    affectedArea: 'autonomy-core',
  });

  return {
    readinessScore: findings.some((item) => item.severity === 'danger') ? 72 : 89,
    findings,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildDiagnostics,
};
