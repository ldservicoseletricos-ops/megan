function buildImprovements(healthOverview, duplicateReport, performanceReport) {
  const suggestions = [
    {
      id: 'imp-fusion-hardening',
      category: 'consolidation',
      title: 'Concluir consolidação dos módulos legados',
      description: 'Encerrar dependência operacional de mobile-app e backend-mobile mantendo apenas frontend/backend como core.',
      priority: 'high',
      affectedArea: 'architecture',
    },
    {
      id: 'imp-runtime-observability',
      category: 'autonomy',
      title: 'Fortalecer coleta de erros em tempo real',
      description: 'Consolidar erros de runtime, HTTP e build em uma única memória operacional com priorização automática.',
      priority: 'high',
      affectedArea: 'frontend/backend',
    },
    {
      id: 'imp-real-integrations',
      category: 'integration',
      title: 'Trocar simulações críticas por integrações reais graduais',
      description: 'Priorizar health, billing, maps e autenticação real nos fluxos mais usados.',
      priority: 'high',
      affectedArea: 'backend',
    },
  ];

  if ((duplicateReport?.duplicateCount || 0) > 0) {
    suggestions.unshift({
      id: 'imp-duplicate-reduction',
      category: 'cleanup',
      title: 'Reduzir duplicações estruturais detectadas',
      description: `O detector encontrou ${duplicateReport.duplicateCount} áreas com duplicação relevante. Consolidar essas bases reduz regressão e custo de manutenção.`,
      priority: 'high',
      affectedArea: 'architecture',
    });
  }

  if ((performanceReport?.score || 0) < 85) {
    suggestions.push({
      id: 'imp-performance-split',
      category: 'performance',
      title: 'Quebrar painéis administrativos em blocos menores',
      description: 'Separar áreas pesadas do frontend para diminuir render inicial e facilitar manutenção.',
      priority: 'medium',
      affectedArea: 'frontend',
    });
  }

  if (healthOverview.modules.some((item) => item.id === 'mobile-legacy' && item.status === 'standby')) {
    suggestions.unshift({
      id: 'imp-legacy-mobile',
      category: 'cleanup',
      title: 'Planejar retirada controlada do mobile legado',
      description: 'O módulo legado segue útil como referência, mas mantém complexidade e duplicação estrutural.',
      priority: 'high',
      affectedArea: 'mobile-app',
    });
  }

  return {
    suggestions,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildImprovements,
};
