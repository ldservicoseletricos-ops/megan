export function buildTripModeState({
  route = {},
  vehicle = {},
  driver = {},
  trip = {}
} = {}) {
  const distanceKm =
    typeof route?.distanceKm === "number"
      ? route.distanceKm
      : typeof trip?.distanceKm === "number"
      ? trip.distanceKm
      : null;

  const etaMinutes =
    typeof route?.etaMinutes === "number"
      ? route.etaMinutes
      : typeof trip?.etaMinutes === "number"
      ? trip.etaMinutes
      : null;

  const fuelLevelPercent =
    typeof vehicle?.live?.fuelLevelPercent === "number"
      ? vehicle.live.fuelLevelPercent
      : typeof vehicle?.fuelLevelPercent === "number"
      ? vehicle.fuelLevelPercent
      : null;

  const avgConsumption =
    typeof trip?.avgConsumption === "number"
      ? trip.avgConsumption
      : typeof vehicle?.trip?.avgConsumption === "number"
      ? vehicle.trip.avgConsumption
      : null;

  const driveMinutes =
    typeof driver?.driveMinutes === "number" ? driver.driveMinutes : 0;

  const estimatedRangeKm =
    typeof fuelLevelPercent === "number" && typeof avgConsumption === "number" && avgConsumption > 0
      ? Math.round((fuelLevelPercent / 100) * 50 * avgConsumption)
      : null;

  const fuelStopRecommended =
    typeof estimatedRangeKm === "number" && typeof distanceKm === "number"
      ? estimatedRangeKm < distanceKm + 20
      : false;

  const restRecommended = driveMinutes >= 120;

  const suggestedStops = [];
  if (fuelStopRecommended) {
    suggestedStops.push({
      type: "fuel",
      priority: "high",
      reason: "Autonomia pode não ser suficiente para o restante da viagem."
    });
  }
  if (restRecommended) {
    suggestedStops.push({
      type: "rest",
      priority: driveMinutes >= 180 ? "high" : "medium",
      reason: "Tempo de direção contínua elevado."
    });
  }

  return {
    ok: true,
    distanceKm,
    etaMinutes,
    fuelLevelPercent,
    estimatedRangeKm,
    fuelStopRecommended,
    restRecommended,
    driveMinutes,
    suggestedStops,
    smartEtaMinutes:
      typeof etaMinutes === "number"
        ? etaMinutes + (fuelStopRecommended ? 12 : 0) + (restRecommended ? 20 : 0)
        : null,
    mode: "trip"
  };
}
