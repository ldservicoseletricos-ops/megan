export function buildDriverFatigueState({
  camera = {},
  attention = {},
  session = {}
} = {}) {
  const eyesClosedScore =
    typeof camera?.eyesClosedScore === "number" ? camera.eyesClosedScore : 0;

  const yawningScore =
    typeof camera?.yawningScore === "number" ? camera.yawningScore : 0;

  const headAwayScore =
    typeof attention?.headAwayScore === "number" ? attention.headAwayScore : 0;

  const driveMinutes =
    typeof session?.driveMinutes === "number" ? session.driveMinutes : 0;

  const fatigueRisk =
    eyesClosedScore >= 70 || yawningScore >= 70 || driveMinutes >= 120;

  const distractionRisk =
    headAwayScore >= 65 || Boolean(attention?.phoneDetected);

  return {
    ok: true,
    fatigue: {
      visible: fatigueRisk,
      level:
        eyesClosedScore >= 85 || yawningScore >= 85 || driveMinutes >= 180
          ? "high"
          : fatigueRisk
          ? "medium"
          : "low",
      eyesClosedScore,
      yawningScore,
      driveMinutes
    },
    attention: {
      visible: distractionRisk,
      level: headAwayScore >= 85 ? "high" : distractionRisk ? "medium" : "low",
      headAwayScore,
      phoneDetected: Boolean(attention?.phoneDetected)
    },
    recommendation:
      fatigueRisk
        ? "pause_recommended"
        : distractionRisk
        ? "focus_required"
        : "normal_drive"
  };
}
