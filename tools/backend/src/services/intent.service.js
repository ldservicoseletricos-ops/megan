function normalizeText(value) {
  return String(value || "").trim();
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function isGreeting(text) {
  const t = lower(text);
  return /^(oi|ola|olá|bom dia|boa tarde|boa noite|opa|e ai|e aí|hey)\b/.test(t);
}

function isWeatherIntent(text) {
  const t = lower(text);
  return /(clima|tempo|temperatura|chuva|vai chover|previs[aã]o|umidade|vento)/.test(t);
}

function isMapIntent(text) {
  const t = lower(text);
  return /(abrir mapa|mostrar mapa|ver mapa|exibir mapa|mapa)/.test(t);
}

function isNavigationIntent(text, destinationText) {
  if (normalizeText(destinationText)) return true;

  const t = lower(text);
  return /(naveg|rota|ir para|vá para|va para|como chegar|me leve|levar para|direções|direcoes|trajeto|destino)/.test(
    t
  );
}

function extractDestinationFromMessage(text) {
  const raw = normalizeText(text);

  const patterns = [
    /(?:ir para|vá para|va para|navegar para|navegue para|rota para|destino(?: para)?|me leve para|levar para|como chegar em)\s+(.+)$/i,
    /(?:mostrar mapa de|abrir mapa de|ver mapa de)\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}

function detectIntent(text, destinationText) {
  if (isNavigationIntent(text, destinationText)) return "navigation";
  if (isWeatherIntent(text)) return "weather";
  if (isMapIntent(text)) return "map";
  if (isGreeting(text)) return "greeting";
  return "general";
}

export {
  normalizeText,
  isGreeting,
  isWeatherIntent,
  isMapIntent,
  isNavigationIntent,
  extractDestinationFromMessage,
  detectIntent,
};