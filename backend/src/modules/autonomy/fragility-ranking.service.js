function buildFragilityRanking({ duplicateReport = {}, performanceReport = {}, errors = [], incidents = [] } = {}) {
  const areas = [
    {
      id: 'frontend',
      label: 'Frontend principal',
      fragilityScore: Math.min(100, 28 + Math.round((duplicateReport.duplicateCount || 0) * 7) + (performanceReport.score < 90 ? 12 : 4)),
      reason: 'Painéis administrativos grandes e evolução rápida exigem consolidação contínua.',
    },
    {
      id: 'autonomy-core',
      label: 'Autonomy Core',
      fragilityScore: Math.min(100, 18 + errors.filter((item) => (item.module || '').includes('autonomy')).length * 8),
      reason: 'Módulo novo, central para diagnóstico e evolução supervisionada.',
    },
    {
      id: 'navigation',
      label: 'Navegação premium',
      fragilityScore: Math.min(100, 24 + incidents.filter((item) => (item.source || '').includes('frontend')).length * 6),
      reason: 'Concentra mais estados visuais e integrações de experiência.',
    },
    {
      id: 'legacy',
      label: 'Legado mobile/base separada',
      fragilityScore: duplicateReport.duplicateCount > 0 ? 72 : 34,
      reason: 'Duplicações estruturais antigas ainda elevam custo de manutenção.',
    },
  ];

  const ranking = areas.sort((a, b) => b.fragilityScore - a.fragilityScore).map((item, index) => ({
    ...item,
    rank: index + 1,
    level: item.fragilityScore >= 70 ? 'high' : item.fragilityScore >= 45 ? 'medium' : 'low',
  }));

  return {
    ok: true,
    ranking,
    topRisk: ranking[0] || null,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildFragilityRanking };
