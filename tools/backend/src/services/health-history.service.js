export function buildHealthHistoryState({
  history = [],
  current = {},
  profile = {}
} = {}) {
  const safeHistory = Array.isArray(history) ? history : [];
  const currentVitals = current?.vitals || {};

  const nextEntry = {
    at: new Date().toISOString(),
    heartRateBpm:
      typeof currentVitals?.heartRateBpm === "number" ? currentVitals.heartRateBpm : null,
    spo2:
      typeof currentVitals?.spo2 === "number" ? currentVitals.spo2 : null,
    bodyTempC:
      typeof currentVitals?.bodyTempC === "number" ? currentVitals.bodyTempC : null,
    stressScore:
      typeof currentVitals?.stressScore === "number" ? currentVitals.stressScore : null,
    sleepHours:
      typeof currentVitals?.sleepHours === "number" ? currentVitals.sleepHours : null,
    hydrationLevel:
      typeof currentVitals?.hydrationLevel === "number" ? currentVitals.hydrationLevel : null
  };

  const timeline = [nextEntry, ...safeHistory].slice(0, 100);

  const average = (key) => {
    const values = timeline
      .map((item) => item?.[key])
      .filter((value) => typeof value === "number");
    if (!values.length) return null;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  };

  const trends = {
    avgHeartRateBpm: average("heartRateBpm"),
    avgSpo2: average("spo2"),
    avgBodyTempC: average("bodyTempC"),
    avgStressScore: average("stressScore"),
    avgSleepHours: average("sleepHours"),
    avgHydrationLevel: average("hydrationLevel")
  };

  const riskFlags = [];

  if (typeof trends.avgHeartRateBpm === "number" && trends.avgHeartRateBpm > 105) {
    riskFlags.push("heart_rate_trend_high");
  }

  if (typeof trends.avgSpo2 === "number" && trends.avgSpo2 < 94) {
    riskFlags.push("spo2_trend_low");
  }

  if (typeof trends.avgBodyTempC === "number" && trends.avgBodyTempC >= 37.7) {
    riskFlags.push("temperature_trend_high");
  }

  if (typeof trends.avgStressScore === "number" && trends.avgStressScore >= 75) {
    riskFlags.push("stress_trend_high");
  }

  if (typeof trends.avgSleepHours === "number" && trends.avgSleepHours < 6) {
    riskFlags.push("sleep_trend_low");
  }

  if (typeof trends.avgHydrationLevel === "number" && trends.avgHydrationLevel < 45) {
    riskFlags.push("hydration_trend_low");
  }

  const suggestedActions = [];
  if (riskFlags.includes("hydration_trend_low")) suggestedActions.push("aumentar_hidratacao");
  if (riskFlags.includes("sleep_trend_low")) suggestedActions.push("priorizar_descanso");
  if (riskFlags.includes("stress_trend_high")) suggestedActions.push("reduzir_estresse");
  if (riskFlags.includes("heart_rate_trend_high")) suggestedActions.push("reduzir_esforco");
  if (riskFlags.includes("temperature_trend_high")) suggestedActions.push("monitorar_temperatura");
  if (riskFlags.includes("spo2_trend_low")) suggestedActions.push("monitorar_respiracao");

  return {
    ok: true,
    profileMode: profile?.mode || "health-monitor",
    timeline,
    trends,
    riskFlags,
    suggestedActions,
    continuity: {
      enabled: true,
      lastUpdatedAt: nextEntry.at,
      sampleCount: timeline.length
    },
    mode: "pocket-hospital"
  };
}
