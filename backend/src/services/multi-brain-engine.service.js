export function runMultiBrainEngine({ message = "", context = {} } = {}) {
  const text = String(message || "").toLowerCase();
  return {
    selectedBrains: [
      text.includes("rota") || text.includes("mapa") ? "navigation" : "conversation",
      text.includes("clima") ? "weather" : "memory",
      "decision"
    ],
    confidence: 0.78,
    context
  };
}

export default {
  runMultiBrainEngine,
};
