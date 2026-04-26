export function optimizeResponse({ reply = "", strategy = "balanced" } = {}) {
  const normalized = String(reply || "").trim();
  return {
    reply: normalized,
    strategy,
    metrics: {
      length: normalized.length,
      optimized: true,
    },
  };
}

export default {
  optimizeResponse,
};
