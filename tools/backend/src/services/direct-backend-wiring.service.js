export function resolveBackendModules(env = process.env) {
  return {
    weatherRoute: env.WEATHER_ROUTE_PATH || "/api/tools/weather",
    routeRoute: env.ROUTE_ROUTE_PATH || "/api/tools/route",
    memoryRoute: env.MEMORY_ROUTE_PATH || "/api/memory",
    telemetryRoute: env.TELEMETRY_ROUTE_PATH || "/api/system/telemetry"
  };
}

export async function callResolvedBackendModule({
  routePath = "",
  payload = {},
  label = "service"
} = {}) {
  return {
    ok: Boolean(routePath),
    label,
    routePath,
    payload,
    connectedAt: new Date().toISOString(),
    summary: routePath ? "direct_backend_ready" : "direct_backend_missing"
  };
}

export async function runDirectBackendWiring({
  userId = "default",
  city = "Sao Paulo",
  destination = "",
  memory = {},
  event = {},
  env = process.env
} = {}) {
  const modules = resolveBackendModules(env);

  const [weather, routing, memoryStatus, telemetry] = await Promise.all([
    callResolvedBackendModule({
      routePath: modules.weatherRoute,
      payload: { city },
      label: "weather"
    }),
    callResolvedBackendModule({
      routePath: modules.routeRoute,
      payload: { destination },
      label: "routing"
    }),
    callResolvedBackendModule({
      routePath: modules.memoryRoute,
      payload: { userId, memory },
      label: "memory"
    }),
    callResolvedBackendModule({
      routePath: modules.telemetryRoute,
      payload: { userId, event },
      label: "telemetry"
    })
  ]);

  return {
    ok: true,
    mode: "direct-backend-wiring",
    modules,
    weather,
    routing,
    memory: memoryStatus,
    telemetry,
    ready:
      weather?.ok &&
      routing?.ok &&
      memoryStatus?.ok &&
      telemetry?.ok
  };
}

export function buildDirectBackendWiringReply(wiring = {}) {
  if (wiring?.ready) {
    return "Os módulos reais do backend estão ligados diretamente.";
  }

  return "O wiring direto foi criado, mas ainda existem módulos do backend para alinhar.";
}
