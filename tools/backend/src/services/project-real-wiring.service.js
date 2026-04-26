export function buildProjectRealWiring({
  env = process.env,
  userId = "default",
  deviceLocation = null,
  memory = {},
  navigation = {}
} = {}) {
  const hasMapsKey = Boolean(env.GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY);
  const hasSupabase =
    Boolean(env.SUPABASE_URL || env.VITE_SUPABASE_URL) &&
    Boolean(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY);

  const hasWeatherBase = true;

  const deviceReady =
    deviceLocation &&
    typeof deviceLocation.lat === "number" &&
    typeof deviceLocation.lng === "number";

  return {
    ok: true,
    mode: "project-real-wiring",
    userId,
    providers: {
      maps: {
        ready: hasMapsKey,
        provider: env.MAPS_PROVIDER || "google-maps"
      },
      memory: {
        ready: hasSupabase,
        provider: env.MEMORY_PROVIDER || "supabase"
      },
      weather: {
        ready: hasWeatherBase,
        provider: env.WEATHER_PROVIDER || "open-meteo"
      },
      telemetry: {
        ready: true,
        provider: env.TELEMETRY_PROVIDER || "internal"
      }
    },
    runtime: {
      deviceReady: Boolean(deviceReady),
      routeActive: Boolean(navigation?.routeActive),
      memorySignals: Object.keys(memory || {}).length
    },
    nextConnections: [
      hasMapsKey ? "maps_connected" : "configure_maps_key",
      hasSupabase ? "memory_connected" : "configure_supabase",
      deviceReady ? "device_location_live" : "device_location_missing"
    ]
  };
}

export function buildProjectRealWiringReply(payload = {}) {
  const next = Array.isArray(payload?.nextConnections) ? payload.nextConnections : [];

  if (next.includes("configure_maps_key") && next.includes("configure_supabase")) {
    return "Mapa e memória persistente ainda precisam ser conectados no projeto real.";
  }

  if (next.includes("configure_maps_key")) {
    return "O próximo passo real é conectar a chave de mapa do projeto.";
  }

  if (next.includes("configure_supabase")) {
    return "O próximo passo real é conectar o Supabase da memória persistente.";
  }

  if (next.includes("device_location_missing")) {
    return "As integrações base estão prontas. Falta somente localização real do aparelho.";
  }

  return "As integrações principais já estão prontas para wiring real no projeto.";
}
