export function buildRerouteState({
  route = null,
  deviceLocation = null,
  offRoute = false
} = {}) {
  const hasLocation =
    deviceLocation &&
    typeof deviceLocation.lat === "number" &&
    typeof deviceLocation.lng === "number";

  return {
    ok: true,
    hasLocation,
    offRoute: Boolean(offRoute),
    shouldReroute: Boolean(route) && Boolean(offRoute) && hasLocation,
    reason: offRoute ? "vehicle_off_original_route" : null,
    updatedAt: new Date().toISOString()
  };
}
