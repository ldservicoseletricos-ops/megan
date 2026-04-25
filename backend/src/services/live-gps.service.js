export function buildLiveGpsState({ deviceLocation = null, routeActive = false } = {}) {
  const hasLocation =
    deviceLocation &&
    typeof deviceLocation.lat === "number" &&
    typeof deviceLocation.lng === "number";

  return {
    ok: true,
    hasLocation,
    routeActive: Boolean(routeActive),
    gps: hasLocation
      ? {
          lat: deviceLocation.lat,
          lng: deviceLocation.lng,
          speedKmh: typeof deviceLocation.speedKmh === "number" ? deviceLocation.speedKmh : 0,
          heading: typeof deviceLocation.heading === "number" ? deviceLocation.heading : 0,
          updatedAt: new Date().toISOString()
        }
      : null
  };
}
