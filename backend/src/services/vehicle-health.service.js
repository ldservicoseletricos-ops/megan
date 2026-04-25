export function buildVehicleHealthState({
  obd = {},
  diagnostics = {},
  trip = {}
} = {}) {
  const engineTempC =
    typeof obd?.engineTempC === "number" ? obd.engineTempC : null;

  const batteryVoltage =
    typeof obd?.batteryVoltage === "number" ? obd.batteryVoltage : null;

  const fuelLevelPercent =
    typeof obd?.fuelLevelPercent === "number" ? obd.fuelLevelPercent : null;

  const rpm =
    typeof obd?.rpm === "number" ? Math.round(obd.rpm) : 0;

  const dtcCodes = Array.isArray(diagnostics?.dtcCodes) ? diagnostics.dtcCodes : [];

  const engineHot = typeof engineTempC === "number" ? engineTempC >= 105 : false;
  const batteryLow =
    typeof batteryVoltage === "number" ? batteryVoltage < 12 : false;
  const fuelLow =
    typeof fuelLevelPercent === "number" ? fuelLevelPercent <= 15 : false;

  const issues = [];
  if (engineHot) issues.push("engine_overheat_risk");
  if (batteryLow) issues.push("battery_low_voltage");
  if (fuelLow) issues.push("low_fuel");
  if (dtcCodes.length) issues.push("diagnostic_codes_detected");

  return {
    ok: true,
    obdConnected: Boolean(obd?.connected),
    live: {
      engineTempC,
      batteryVoltage,
      fuelLevelPercent,
      rpm,
      speedKmh: typeof obd?.speedKmh === "number" ? Math.round(obd.speedKmh) : 0
    },
    diagnostics: {
      dtcCodes,
      checkEngine: Boolean(diagnostics?.checkEngine || dtcCodes.length)
    },
    trip: {
      distanceKm: typeof trip?.distanceKm === "number" ? trip.distanceKm : null,
      avgConsumption: typeof trip?.avgConsumption === "number" ? trip.avgConsumption : null
    },
    issues,
    healthScore:
      issues.length === 0 ? 100 :
      issues.length === 1 ? 82 :
      issues.length === 2 ? 65 : 45
  };
}
