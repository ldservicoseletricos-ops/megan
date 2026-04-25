export function buildDriverAssistState({
  lane = {},
  speedSign = {},
  roadRisk = {},
  gps = {}
} = {}) {
  const currentSpeedKmh =
    typeof gps?.speedKmh === "number" ? Math.round(gps.speedKmh) : 0;

  const speedLimitKmh =
    typeof speedSign?.speedLimitKmh === "number"
      ? speedSign.speedLimitKmh
      : null;

  const overSpeed =
    typeof speedLimitKmh === "number" ? currentSpeedKmh > speedLimitKmh : false;

  return {
    ok: true,
    laneAssist: {
      visible: Boolean(lane?.visible),
      departureRisk: Boolean(lane?.departureRisk),
      suggestedCorrection: lane?.suggestedCorrection || null
    },
    speedSign: {
      detected: Boolean(speedSign?.detected),
      speedLimitKmh,
      overSpeed
    },
    roadRisk: {
      visible: Boolean(roadRisk?.visible),
      type: roadRisk?.type || null,
      severity: roadRisk?.severity || "low",
      distanceMeters:
        typeof roadRisk?.distanceMeters === "number"
          ? roadRisk.distanceMeters
          : null
    },
    currentSpeedKmh
  };
}
