export function buildHealthRoutineState({
  healthHistory = {},
  routine = {},
  profile = {}
} = {}) {
  const trends = healthHistory?.trends || {};
  const riskFlags = Array.isArray(healthHistory?.riskFlags) ? healthHistory.riskFlags : [];

  const morningCheckDone = Boolean(routine?.morningCheckDone);
  const waterIntakeMl = typeof routine?.waterIntakeMl === "number" ? routine.waterIntakeMl : 0;
  const steps = typeof routine?.steps === "number" ? routine.steps : 0;
  const breathingMinutes = typeof routine?.breathingMinutes === "number" ? routine.breathingMinutes : 0;

  const predictedRiskLevel =
    riskFlags.length >= 4 ? "high" :
    riskFlags.length >= 2 ? "medium" :
    "low";

  const dailyActions = [];

  if (!morningCheckDone) dailyActions.push("fazer_check_matinal");
  if (waterIntakeMl < 1500) dailyActions.push("aumentar_agua");
  if (steps < 4000) dailyActions.push("mover_corpo");
  if (breathingMinutes < 5 && typeof trends?.avgStressScore === "number" && trends.avgStressScore >= 70) {
    dailyActions.push("respiracao_guiada");
  }
  if (typeof trends?.avgSleepHours === "number" && trends.avgSleepHours < 6) {
    dailyActions.push("priorizar_sono");
  }

  return {
    ok: true,
    profileMode: profile?.mode || "daily-health",
    predictedRiskLevel,
    routine: {
      morningCheckDone,
      waterIntakeMl,
      steps,
      breathingMinutes
    },
    dailyActions,
    automaticFollowup: {
      enabled: true,
      nextCheckWindow: "today",
      status: "active"
    },
    mode: "smart-health-routine"
  };
}
