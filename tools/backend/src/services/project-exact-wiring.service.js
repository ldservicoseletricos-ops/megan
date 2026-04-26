export function resolveExactProjectTargets(env = process.env) {
  return {
    backend: {
      health: env.PROJECT_HEALTH_ROUTE || "/api/health",
      chat: env.PROJECT_CHAT_ROUTE || "/api/chat",
      weather: env.PROJECT_WEATHER_ROUTE || "/api/tools/weather",
      route: env.PROJECT_ROUTE_ROUTE || "/api/tools/route",
      upload: env.PROJECT_UPLOAD_ROUTE || "/api/upload"
    },
    frontend: {
      apiUrl: env.VITE_API_URL || env.FRONTEND_API_URL || "http://localhost:10000",
      mapsKeyPresent: Boolean(env.VITE_GOOGLE_MAPS_API_KEY || env.GOOGLE_MAPS_API_KEY)
    },
    memory: {
      provider: env.MEMORY_PROVIDER || "supabase",
      ready: Boolean(
        (env.SUPABASE_URL || env.VITE_SUPABASE_URL) &&
        (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY)
      )
    }
  };
}

export function buildProjectExactWiringStatus({
  userId = "default",
  memory = {},
  navigation = {},
  env = process.env
} = {}) {
  const targets = resolveExactProjectTargets(env);

  const checks = {
    chatReady: Boolean(targets.backend.chat),
    weatherReady: Boolean(targets.backend.weather),
    routeReady: Boolean(targets.backend.route),
    uploadReady: Boolean(targets.backend.upload),
    apiUrlReady: Boolean(targets.frontend.apiUrl),
    mapsReady: Boolean(targets.frontend.mapsKeyPresent),
    memoryReady: Boolean(targets.memory.ready)
  };

  const issues = [];
  if (!checks.mapsReady) issues.push("maps_key_missing");
  if (!checks.memoryReady) issues.push("memory_provider_missing");

  return {
    ok: true,
    mode: "project-exact-wiring-transition",
    userId,
    targets,
    checks,
    issues,
    runtime: {
      memorySignals: Object.keys(memory || {}).length,
      routeActive: Boolean(navigation?.routeActive)
    },
    ready:
      checks.chatReady &&
      checks.weatherReady &&
      checks.routeReady &&
      checks.uploadReady &&
      checks.apiUrlReady
  };
}

export function buildProjectExactWiringReply(status = {}) {
  if (status?.ready && !(status?.issues || []).length) {
    return "Os pontos exatos do projeto já estão alinhados para a transição real.";
  }

  if ((status?.issues || []).includes("maps_key_missing")) {
    return "A base está ligada, mas ainda falta a chave real do mapa.";
  }

  if ((status?.issues || []).includes("memory_provider_missing")) {
    return "A base está ligada, mas ainda falta o provider real de memória.";
  }

  return "Os pontos exatos do projeto foram mapeados e a transição real foi preparada.";
}
