function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

export function deriveInternalGoals({ diagnostics, hypotheses = [], activeGoals = [] }) {
  const activeGoalSlugs = new Set(activeGoals.map((item) => item.slug));
  const goals = [];

  if ((diagnostics.lowScoreRate || 0) >= 0.25) {
    goals.push({
      slug: "raise-average-score",
      title: "Elevar score médio",
      description: "Reduzir respostas fracas e aumentar consistência geral do núcleo.",
      category: "quality",
      priority: "high",
      targetMetric: "averageScore",
      targetValue: 0.92,
      currentValue: round(diagnostics.averageScore),
      rationale: "A taxa de scores baixos ainda está acima do ideal.",
      actions: [
        "Aumentar profundidade de planejamento em tarefas frágeis.",
        "Aplicar validação extra antes da resposta final."
      ]
    });
  }

  if ((diagnostics.warningRate || 0) >= 0.3) {
    goals.push({
      slug: "reduce-critic-warnings",
      title: "Reduzir avisos do crítico",
      description: "Diminuir saídas superficiais, vagas ou com baixa rastreabilidade.",
      category: "reliability",
      priority: "high",
      targetMetric: "warningRate",
      targetValue: 0.18,
      currentValue: round(diagnostics.warningRate),
      rationale: "O crítico ainda precisa intervir em excesso.",
      actions: [
        "Fortalecer checkpoints de clareza e completude.",
        "Reforçar revisão em tarefas complexas."
      ]
    });
  }

  if ((diagnostics.technicalFixShare || 0) >= 0.35) {
    goals.push({
      slug: "specialize-technical-fix",
      title: "Especializar correções técnicas",
      description: "Melhorar assertividade quando a Megan recebe pedidos de correção e depuração.",
      category: "specialization",
      priority: "medium",
      targetMetric: "technicalFixShare",
      targetValue: round(diagnostics.technicalFixShare),
      currentValue: round(diagnostics.technicalFixShare),
      rationale: "O volume técnico é alto e merece fluxo mais especializado.",
      actions: [
        "Diagnosticar arquivo e causa raiz antes de responder.",
        "Priorizar sugestões de correção com menor risco."
      ]
    });
  }

  if (hypotheses.length >= 2) {
    goals.push({
      slug: "increase-self-adaptation",
      title: "Ampliar adaptação interna",
      description: "Transformar hipóteses recorrentes em melhorias com ciclo mais consistente.",
      category: "autonomy",
      priority: "medium",
      targetMetric: "approvedHypotheses",
      targetValue: Math.max(1, hypotheses.length - 1),
      currentValue: hypotheses.length,
      rationale: "Há sinais suficientes para a Megan converter diagnóstico em melhoria acionável.",
      actions: [
        "Criar propostas de melhoria ligadas a metas internas.",
        "Registrar memória evolutiva do que funcionou."
      ]
    });
  }

  return goals.map((item) => ({
    ...item,
    status: activeGoalSlugs.has(item.slug) ? "active" : "active"
  }));
}
