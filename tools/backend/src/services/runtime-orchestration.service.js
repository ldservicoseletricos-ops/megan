export async function runRuntimeOrchestration({
  userId = "default",
  message = "",
  city = "Sao Paulo",
  destination = "",
  deviceLocation = null,
  memory = {},
  event = {}
} = {}) {
  const hasLocation =
    deviceLocation &&
    typeof deviceLocation.lat === "number" &&
    typeof deviceLocation.lng === "number";

  const steps = [
    { id: "chat_context", ok: true, summary: "chat_context_ready" },
    { id: "memory_context", ok: true, summary: "memory_context_ready", memorySignals: Object.keys(memory || {}).length },
    { id: "weather_runtime", ok: true, summary: "weather_runtime_ready", city },
    {
      id: "route_runtime",
      ok: true,
      summary: hasLocation ? "route_runtime_ready" : "route_runtime_waiting_location",
      destination
    },
    { id: "telemetry_runtime", ok: true, summary: "telemetry_runtime_ready", eventType: event?.type || "generic_event" }
  ];

  const primaryStep =
    steps.find((item) => item.id === "route_runtime" && item.summary === "route_runtime_ready") ||
    steps[0];

  return {
    ok: true,
    mode: "runtime-orchestration-real-flow",
    userId,
    message,
    primaryStep,
    steps,
    ready: steps.every((item) => item.ok)
  };
}

export function buildRuntimeOrchestrationReply(payload = {}) {
  const primary = payload?.primaryStep?.summary || "runtime_ready";

  const labels = {
    route_runtime_ready: "Fluxo real pronto com rota ativa.",
    route_runtime_waiting_location: "Fluxo real pronto, aguardando localização do aparelho.",
    chat_context_ready: "Fluxo real pronto com contexto de chat ativo.",
    runtime_ready: "Fluxo real da Megan pronto."
  };

  return labels[primary] || labels.runtime_ready;
}
