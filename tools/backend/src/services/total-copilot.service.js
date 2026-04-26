export function buildTotalCopilotState({
  navigation = {},
  traffic = {},
  driver = {},
  vehicle = {}
} = {}) {
  const routeActive = Boolean(navigation?.routeActive);
  const speedKmh =
    typeof navigation?.speedKmh === "number"
      ? Math.round(navigation.speedKmh)
      : typeof vehicle?.live?.speedKmh === "number"
      ? Math.round(vehicle.live.speedKmh)
      : 0;

  const alerts = [];

  if (driver?.fatigue?.visible) {
    alerts.push({
      type: "driver_fatigue",
      severity: driver?.fatigue?.level || "medium",
      title: "Fadiga detectada"
    });
  }

  if (driver?.attention?.visible) {
    alerts.push({
      type: "driver_attention",
      severity: driver?.attention?.level || "medium",
      title: "Atenção fora da pista"
    });
  }

  if (traffic?.primaryAlert) {
    alerts.push({
      type: "traffic",
      severity: traffic?.primaryAlert?.severity || "medium",
      title: traffic.primaryAlert.title || "Alerta de trânsito"
    });
  }

  if (Array.isArray(vehicle?.issues) && vehicle.issues.length) {
    alerts.push({
      type: "vehicle_health",
      severity: vehicle?.healthScore <= 65 ? "high" : "medium",
      title: "Alerta mecânico do veículo"
    });
  }

  const severityRank = { low: 1, medium: 2, high: 3 };
  const primaryAlert =
    [...alerts].sort(
      (a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
    )[0] || null;

  return {
    ok: true,
    routeActive,
    speedKmh,
    etaMinutes:
      typeof navigation?.etaMinutes === "number" ? navigation.etaMinutes : null,
    trafficLevel: traffic?.trafficLevel || "normal",
    healthScore:
      typeof vehicle?.healthScore === "number" ? vehicle.healthScore : null,
    driverStatus: {
      fatigueVisible: Boolean(driver?.fatigue?.visible),
      attentionVisible: Boolean(driver?.attention?.visible)
    },
    alerts,
    primaryAlert,
    mode: "total-copilot"
  };
}
