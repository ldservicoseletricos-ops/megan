export function buildMultiRouteState({
  routes = [],
  preference = "fastest",
  trafficLevel = "normal"
} = {}) {
  const safeRoutes = Array.isArray(routes) ? routes : [];

  const normalizedRoutes = safeRoutes.map((route, index) => ({
    id: route?.id || `route_${index + 1}`,
    name: route?.name || `Rota ${index + 1}`,
    etaMinutes: typeof route?.etaMinutes === "number" ? route.etaMinutes : null,
    distanceKm: typeof route?.distanceKm === "number" ? route.distanceKm : null,
    tolls: Boolean(route?.tolls),
    riskLevel: route?.riskLevel || "medium",
    fuelScore: typeof route?.fuelScore === "number" ? route.fuelScore : 50,
    trafficScore: typeof route?.trafficScore === "number" ? route.trafficScore : 50
  }));

  const pickBest = () => {
    if (!normalizedRoutes.length) return null;

    if (preference === "safest") {
      return [...normalizedRoutes].sort((a, b) => {
        const rank = { low: 1, medium: 2, high: 3 };
        return (rank[a.riskLevel] || 99) - (rank[b.riskLevel] || 99);
      })[0];
    }

    if (preference === "economic") {
      return [...normalizedRoutes].sort((a, b) => (b.fuelScore || 0) - (a.fuelScore || 0))[0];
    }

    return [...normalizedRoutes].sort((a, b) => (a.etaMinutes || 9999) - (b.etaMinutes || 9999))[0];
  };

  const selectedRoute = pickBest();

  return {
    ok: true,
    trafficLevel: String(trafficLevel || "normal").toLowerCase(),
    preference,
    routes: normalizedRoutes,
    selectedRoute
  };
}
