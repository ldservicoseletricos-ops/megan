export function buildMeganUnifiedCore({
  health = {},
  copilot = {},
  vehicle = {},
  navigation = {},
  memory = {}
} = {}) {
  const alerts = [];

  if (Array.isArray(health?.alerts)) {
    health.alerts.forEach((item, index) => {
      alerts.push({
        id: item?.id || `health_${index + 1}`,
        domain: "health",
        title: item?.title || "Alerta de saúde",
        severity: item?.severity || "medium"
      });
    });
  }

  if (copilot?.primaryAlert) {
    alerts.push({
      id: "copilot_primary",
      domain: "copilot",
      title: copilot.primaryAlert.title || "Alerta de direção",
      severity: copilot.primaryAlert.severity || "medium"
    });
  }

  if (Array.isArray(vehicle?.issues)) {
    vehicle.issues.forEach((item, index) => {
      alerts.push({
        id: `vehicle_${index + 1}`,
        domain: "vehicle",
        title: item,
        severity: vehicle?.healthScore <= 65 ? "high" : "medium"
      });
    });
  }

  if (navigation?.isOffRoute) {
    alerts.push({
      id: "nav_offroute",
      domain: "navigation",
      title: "Veículo fora da rota",
      severity: "high"
    });
  }

  if (navigation?.hasArrived) {
    alerts.push({
      id: "nav_arrived",
      domain: "navigation",
      title: "Chegada ao destino",
      severity: "low"
    });
  }

  const rank = { low: 1, medium: 2, high: 3 };
  const primaryAlert =
    [...alerts].sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0))[0] || null;

  const memorySignals = Object.keys(memory || {}).length;

  return {
    ok: true,
    mode: "megan-unified-core",
    primaryAlert,
    alerts,
    summary: {
      healthScore: typeof health?.healthScore === "number" ? health.healthScore : null,
      vehicleHealthScore: typeof vehicle?.healthScore === "number" ? vehicle.healthScore : null,
      speedKmh:
        typeof copilot?.speedKmh === "number"
          ? copilot.speedKmh
          : typeof vehicle?.live?.speedKmh === "number"
          ? vehicle.live.speedKmh
          : 0,
      etaMinutes:
        typeof copilot?.etaMinutes === "number"
          ? copilot.etaMinutes
          : typeof navigation?.etaMinutes === "number"
          ? navigation.etaMinutes
          : null,
      routeActive: Boolean(copilot?.routeActive || navigation?.routeActive),
      memorySignals
    }
  };
}
