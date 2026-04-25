import { AI_CONFIG } from "../config/ai.config.js";

function round(value) {
  return Number((Number(value) || 0).toFixed(3));
}

export function generateHypotheses({ interactions, experiments, diagnostics, activeGoals = [] }) {
  const hypotheses = [];
  const alreadyTestedNames = new Set(experiments.map((exp) => exp.name));
  const goalSlugs = new Set(activeGoals.map((goal) => goal.slug));

  if ((diagnostics.lowScoreRate || 0) >= 0.3 || goalSlugs.has("raise-average-score")) {
    hypotheses.push({
      name: "raise_reasoning_depth_for_low_scores",
      hypothesis: "Aumentar profundidade guiada por checkpoints pode reduzir respostas superficiais em casos de score baixo.",
      candidateVersion: "v5-depth-optimizer",
      reason: "Taxa de score baixo acima do limite desejado ou meta interna ativa de qualidade.",
      expectedTargets: ["planning", "execution", "communication"],
      risk: "low",
      signals: {
        lowScoreRate: round(diagnostics.lowScoreRate),
        averageScore: round(diagnostics.averageScore)
      }
    });
  }

  if ((diagnostics.warningRate || 0) >= AI_CONFIG.evolution.warningRateThreshold || goalSlugs.has("reduce-critic-warnings")) {
    hypotheses.push({
      name: "tighten_critic_guardrails",
      hypothesis: "Fortalecer guardrails do crítico pode reduzir respostas curtas e superficiais antes da entrega.",
      candidateVersion: "v5-critic-guardrails",
      reason: "Muitas respostas recentes acionaram avisos do crítico ou a Megan está perseguindo maior confiabilidade.",
      expectedTargets: ["communication", "alignment", "safety"],
      risk: "low",
      signals: {
        warningRate: round(diagnostics.warningRate),
        warningInteractions: diagnostics.warningInteractions
      }
    });
  }

  if ((diagnostics.technicalFixShare || 0) >= 0.4 && (diagnostics.averageScore || 0) < 0.9) {
    hypotheses.push({
      name: "specialize_technical_fix_flow",
      hypothesis: "Especializar o fluxo técnico com diagnóstico mais objetivo pode aumentar assertividade em correções.",
      candidateVersion: "v5-technical-specialist",
      reason: "Volume alto de pedidos técnicos com espaço para melhorar score médio.",
      expectedTargets: ["understanding", "planning", "execution"],
      risk: "medium",
      signals: {
        technicalFixShare: round(diagnostics.technicalFixShare),
        averageScore: round(diagnostics.averageScore)
      }
    });
  }

  if ((diagnostics.selfEvolutionShare || 0) >= 0.3 || goalSlugs.has("increase-self-adaptation")) {
    hypotheses.push({
      name: "expand_self_evolution_visibility",
      hypothesis: "Expor estado ativo da autoevolução e perfil atual pode melhorar rastreabilidade e controle da Megan.",
      candidateVersion: "v5-evolution-visibility",
      reason: "Há recorrência de pedidos ligados à evolução da própria IA e metas internas de adaptação.",
      expectedTargets: ["alignment", "communication", "autonomy"],
      risk: "low",
      signals: {
        selfEvolutionShare: round(diagnostics.selfEvolutionShare),
        recentInteractions: diagnostics.totalInteractions
      }
    });
  }

  return hypotheses.filter((item) => !alreadyTestedNames.has(item.name));
}
