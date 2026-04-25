function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function buildContextStrategy(context = {}) {
  const text = normalizeText(context.text);
  const isNavigation = context.intent === "navigation" || /(rota|navega|me leva|como chegar)/.test(text);
  const isWeather = context.intent === "weather" || /(clima|chuva|tempo|temperatura)/.test(text);

  const mode = isNavigation ? "navigation_first" : isWeather ? "weather_first" : "general_assist";
  const guidance = {
    mode,
    shouldOpenMap: Boolean(isNavigation),
    shouldKeepReplyShort: Boolean(isNavigation || /rápido|rapido|curto|direto/.test(text)),
    shouldPreserveContext: true,
    reason: isNavigation
      ? "Pedido pede ação em movimento e baixa fricção."
      : isWeather
      ? "Pedido pede status ambiental imediato."
      : "Pedido geral com contexto de conversa.",
  };

  return guidance;
}
