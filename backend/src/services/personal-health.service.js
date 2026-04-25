export function buildPersonalHealthState({
  sensors = {},
  profile = {},
  session = {}
} = {}) {
  const heartRateBpm =
    typeof sensors?.heartRateBpm === "number" ? Math.round(sensors.heartRateBpm) : null;

  const spo2 =
    typeof sensors?.spo2 === "number" ? sensors.spo2 : null;

  const bodyTempC =
    typeof sensors?.bodyTempC === "number" ? sensors.bodyTempC : null;

  const stressScore =
    typeof sensors?.stressScore === "number" ? sensors.stressScore : 0;

  const sleepHours =
    typeof session?.sleepHours === "number" ? session.sleepHours : null;

  const hydrationLevel =
    typeof session?.hydrationLevel === "number" ? session.hydrationLevel : null;

  const alerts = [];

  if (typeof heartRateBpm === "number" && heartRateBpm > 110) {
    alerts.push({
      type: "heart_rate_high",
      severity: heartRateBpm >= 130 ? "high" : "medium",
      title: "Frequência cardíaca elevada"
    });
  }

  if (typeof spo2 === "number" && spo2 < 94) {
    alerts.push({
      type: "spo2_low",
      severity: spo2 < 90 ? "high" : "medium",
      title: "Oxigenação abaixo do ideal"
    });
  }

  if (typeof bodyTempC === "number" && bodyTempC >= 37.8) {
    alerts.push({
      type: "temperature_high",
      severity: bodyTempC >= 39 ? "high" : "medium",
      title: "Temperatura corporal elevada"
    });
  }

  if (stressScore >= 75) {
    alerts.push({
      type: "stress_high",
      severity: stressScore >= 90 ? "high" : "medium",
      title: "Estresse elevado"
    });
  }

  if (typeof sleepHours === "number" && sleepHours < 6) {
    alerts.push({
      type: "sleep_low",
      severity: sleepHours < 4 ? "high" : "medium",
      title: "Sono insuficiente"
    });
  }

  if (typeof hydrationLevel === "number" && hydrationLevel < 40) {
    alerts.push({
      type: "hydration_low",
      severity: hydrationLevel < 25 ? "high" : "medium",
      title: "Hidratação baixa"
    });
  }

  const recommendations = [];
  if (alerts.some((a) => a.type === "hydration_low")) recommendations.push("beber_agua");
  if (alerts.some((a) => a.type === "sleep_low")) recommendations.push("descansar");
  if (alerts.some((a) => a.type === "stress_high")) recommendations.push("reduzir_estresse");
  if (alerts.some((a) => a.type === "heart_rate_high")) recommendations.push("reduzir_atividade");

  return {
    ok: true,
    profileMode: profile?.mode || "wellness",
    vitals: {
      heartRateBpm,
      spo2,
      bodyTempC,
      stressScore,
      sleepHours,
      hydrationLevel
    },
    alerts,
    recommendations,
    healthScore:
      alerts.length === 0 ? 100 :
      alerts.length === 1 ? 85 :
      alerts.length === 2 ? 70 : 50,
    mode: "personal-health"
  };
}
