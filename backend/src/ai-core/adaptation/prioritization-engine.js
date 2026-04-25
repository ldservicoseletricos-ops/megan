import { AI_CONFIG } from "../config/ai.config.js";

function rankScore(item) {
  return Number((item.impactScore * 0.5 + item.urgencyScore * 0.3 + item.recurringScore * 0.2).toFixed(3));
}

export function prioritizeAdaptiveFocus({ diagnostics = {}, activeGoals = [], userProfile = null }) {
  const priorities = [];

  if ((diagnostics.lowScoreRate || 0) >= 0.2) {
    priorities.push({
      slug: "improve_response_quality",
      title: "Melhorar qualidade média das respostas",
      impactScore: 0.9,
      urgencyScore: Math.min(1, diagnostics.lowScoreRate + 0.35),
      recurringScore: 0.7
    });
  }

  if ((diagnostics.warningRate || 0) >= 0.15) {
    priorities.push({
      slug: "reduce_critic_warnings",
      title: "Reduzir alertas do crítico",
      impactScore: 0.82,
      urgencyScore: Math.min(1, diagnostics.warningRate + 0.25),
      recurringScore: 0.68
    });
  }

  for (const goal of activeGoals.slice(0, 4)) {
    const remainingGap = Math.max(0, Number(goal.targetValue || 0) - Number(goal.currentValue || 0));
    priorities.push({
      slug: `goal_${goal.slug}`,
      title: `Acelerar meta: ${goal.title}`,
      impactScore: Math.min(1, 0.55 + remainingGap),
      urgencyScore: goal.priority === "high" ? 0.85 : 0.6,
      recurringScore: 0.65
    });
  }

  if (userProfile?.preferredMode === "technical_operator") {
    priorities.push({
      slug: "deliver_ready_to_apply_outputs",
      title: "Entregar saídas prontas para aplicar",
      impactScore: 0.88,
      urgencyScore: 0.7,
      recurringScore: 0.8
    });
  }

  if (userProfile?.detailLevel === "deep") {
    priorities.push({
      slug: "preserve_deep_context",
      title: "Preservar contexto e profundidade",
      impactScore: 0.76,
      urgencyScore: 0.55,
      recurringScore: 0.72
    });
  }

  const deduped = Object.values(
    priorities.reduce((acc, item) => {
      if (!acc[item.slug] || rankScore(item) > rankScore(acc[item.slug])) {
        acc[item.slug] = item;
      }
      return acc;
    }, {})
  );

  return deduped
    .map((item) => ({ ...item, rankScore: rankScore(item) }))
    .sort((a, b) => b.rankScore - a.rankScore)
    .slice(0, AI_CONFIG.adaptation.maxTopPriorities);
}
