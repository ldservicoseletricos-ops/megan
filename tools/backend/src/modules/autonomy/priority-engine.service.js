function buildPriorities({ fragilityRanking = {}, improvements = {}, learningSummary = {}, projectHealth = {} } = {}) {
  const base = [];
  const topRisk = fragilityRanking.topRisk;
  if (topRisk) {
    base.push({
      id: 'prio-top-risk',
      title: `Reduzir fragilidade de ${topRisk.label}`,
      priority: 'critical',
      impact: 'high',
      effort: 'medium',
      rationale: topRisk.reason,
    });
  }

  (improvements.suggestions || []).slice(0, 4).forEach((item, index) => {
    base.push({
      id: `prio-improvement-${index + 1}`,
      title: item.title,
      priority: index === 0 ? 'high' : (item.priority || 'medium'),
      impact: item.priority === 'high' ? 'high' : 'medium',
      effort: item.affectedArea === 'architecture' ? 'medium' : 'low',
      rationale: item.description,
    });
  });

  if ((learningSummary.topRecurring || []).length > 0) {
    const recurring = learningSummary.topRecurring[0];
    base.unshift({
      id: 'prio-recurring',
      title: 'Quebrar padrão de erro recorrente mais frequente',
      priority: 'critical',
      impact: 'high',
      effort: 'low',
      rationale: `Fingerprint ${recurring.fingerprint} apareceu ${recurring.occurrences} vez(es).`,
    });
  }

  if ((projectHealth.totalScore || 100) < 85) {
    base.push({
      id: 'prio-health-score',
      title: 'Elevar score global do projeto acima de 85',
      priority: 'high',
      impact: 'high',
      effort: 'medium',
      rationale: 'A saúde geral do projeto ainda está abaixo da meta recomendada para estabilidade contínua.',
    });
  }

  return {
    ok: true,
    priorities: base.slice(0, 6),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildPriorities };
