export function buildOperationalFinalCore({
  chat = {},
  memory = {},
  navigation = {},
  health = {},
  vehicle = {},
  autonomy = {}
} = {}) {
  const alerts = [];

  if (navigation?.isOffRoute) {
    alerts.push({
      domain: "navigation",
      severity: "high",
      title: "Veículo fora da rota",
      action: "reroute_now"
    });
  }

  if (Array.isArray(health?.alerts)) {
    health.alerts.forEach((item) => {
      alerts.push({
        domain: "health",
        severity: item?.severity || "medium",
        title: item?.title || "Alerta de saúde",
        action: "health_attention"
      });
    });
  }

  if (Array.isArray(vehicle?.issues)) {
    vehicle.issues.forEach((item) => {
      alerts.push({
        domain: "vehicle",
        severity: vehicle?.healthScore <= 65 ? "high" : "medium",
        title: item,
        action: "vehicle_attention"
      });
    });
  }

  if (autonomy?.primary) {
    alerts.push({
      domain: "autonomy",
      severity: "medium",
      title: "Autonomia coordenada ativa",
      action: autonomy.primary
    });
  }

  const rank = { low: 1, medium: 2, high: 3 };
  const primary =
    [...alerts].sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0))[0] ||
    {
      domain: "assistant",
      severity: "low",
      title: "Assistência normal",
      action: "normal_assist"
    };

  return {
    ok: true,
    mode: "operational-final-core",
    primary,
    alerts,
    summary: {
      lastUserMessage: chat?.message || "",
      memorySignals: Object.keys(memory || {}).length,
      routeActive: Boolean(navigation?.routeActive),
      healthScore: typeof health?.healthScore === "number" ? health.healthScore : null,
      vehicleHealthScore: typeof vehicle?.healthScore === "number" ? vehicle.healthScore : null,
      autonomySteps: Array.isArray(autonomy?.steps) ? autonomy.steps.length : 0
    }
  };
}

export function buildOperationalFinalReply(core = {}) {
  const action = core?.primary?.action || "normal_assist";

  const labels = {
    reroute_now: "Vou recalcular a rota imediatamente.",
    health_attention: "Vou priorizar o alerta de saúde agora.",
    vehicle_attention: "Vou priorizar a condição do veículo.",
    normal_assist: "Vou seguir com assistência completa e monitoramento ativo."
  };

  return labels[action] || "Vou agir com prioridade unificada no núcleo operacional.";
}
