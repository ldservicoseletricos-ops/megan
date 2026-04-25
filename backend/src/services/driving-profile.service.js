export function buildDrivingProfile({
  memory = {},
  trip = {},
  driver = {},
  vehicle = {}
} = {}) {
  const current = memory?.drivingProfile || {};

  const avgSpeedKmh =
    typeof trip?.avgSpeedKmh === "number" ? Math.round(trip.avgSpeedKmh) : current.avgSpeedKmh || 0;

  const hardBrakeCount =
    typeof trip?.hardBrakeCount === "number" ? trip.hardBrakeCount : 0;

  const hardAccelerationCount =
    typeof trip?.hardAccelerationCount === "number" ? trip.hardAccelerationCount : 0;

  const fatigueEvents =
    typeof driver?.fatigueEvents === "number" ? driver.fatigueEvents : 0;

  const riskEvents =
    hardBrakeCount + hardAccelerationCount + fatigueEvents;

  const style =
    riskEvents >= 8 ? "aggressive" :
    riskEvents >= 4 ? "dynamic" :
    "smooth";

  const nextProfile = {
    avgSpeedKmh,
    hardBrakeCount,
    hardAccelerationCount,
    fatigueEvents,
    vehicleHealthScore:
      typeof vehicle?.healthScore === "number" ? vehicle.healthScore : null,
    style,
    updatedAt: new Date().toISOString()
  };

  return {
    ...memory,
    drivingProfile: nextProfile
  };
}

export function buildDrivingAdaptation(profile = {}) {
  const driving = profile?.drivingProfile || {};
  const style = driving.style || "smooth";

  return {
    ok: true,
    style,
    alertSensitivity:
      style === "aggressive" ? "high" :
      style === "dynamic" ? "medium" :
      "balanced",
    guidanceStyle:
      style === "aggressive" ? "preventive" :
      style === "dynamic" ? "active" :
      "calm"
  };
}
