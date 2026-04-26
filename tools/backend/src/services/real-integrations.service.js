export function buildIntegrationConfig(env = process.env) {
  return {
    weather: {
      provider: env.WEATHER_PROVIDER || "open-meteo",
      city: env.DEFAULT_WEATHER_CITY || "Sao Paulo"
    },
    maps: {
      provider: env.MAPS_PROVIDER || "google-maps",
      apiKeyPresent: Boolean(env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY)
    },
    memory: {
      provider: env.MEMORY_PROVIDER || "supabase",
      supabaseUrlPresent: Boolean(env.SUPABASE_URL || env.VITE_SUPABASE_URL),
      supabaseAnonKeyPresent: Boolean(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY)
    },
    telemetry: {
      provider: env.TELEMETRY_PROVIDER || "internal"
    }
  };
}

export function buildRealIntegrationStatus({
  env = process.env,
  navigation = {},
  memory = {},
  userId = "default"
} = {}) {
  const config = buildIntegrationConfig(env);

  const providers = {
    weatherReady: config.weather.provider === "open-meteo",
    mapsReady: Boolean(config.maps.apiKeyPresent),
    memoryReady:
      config.memory.provider === "supabase"
        ? Boolean(config.memory.supabaseUrlPresent && config.memory.supabaseAnonKeyPresent)
        : true,
    telemetryReady: true
  };

  const issues = [];
  if (!providers.mapsReady) issues.push("maps_provider_not_ready");
  if (!providers.memoryReady) issues.push("memory_provider_not_ready");

  return {
    ok: true,
    mode: "real-integrations-upgrade",
    userId,
    providers,
    issues,
    config,
    runtime: {
      routeActive: Boolean(navigation?.routeActive),
      memorySignals: Object.keys(memory || {}).length
    }
  };
}

export function buildRealIntegrationReply(status = {}) {
  const issues = Array.isArray(status?.issues) ? status.issues : [];

  if (!issues.length) {
    return "As integrações principais estão prontas para uso real.";
  }

  if (issues.includes("maps_provider_not_ready") && issues.includes("memory_provider_not_ready")) {
    return "Faltam ajustar mapa e memória persistente real.";
  }

  if (issues.includes("maps_provider_not_ready")) {
    return "Falta ajustar a integração real de mapa.";
  }

  if (issues.includes("memory_provider_not_ready")) {
    return "Falta ajustar a integração real de memória persistente.";
  }

  return "As integrações reais estão em preparação.";
}
