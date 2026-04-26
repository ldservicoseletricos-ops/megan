const GEMINI_API_KEY = String(process.env.GEMINI_API_KEY || "").trim();
const GEMINI_MODEL = String(process.env.GEMINI_MODEL || "gemini-2.5-flash").trim();

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function isTruthyLocation(deviceLocation) {
  return Boolean(
    deviceLocation &&
      Number.isFinite(Number(deviceLocation.lat)) &&
      Number.isFinite(Number(deviceLocation.lon))
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Falha ao consultar serviço externo (${response.status}).`);
  }
  return response.json();
}

function summarizeWeather(weather) {
  if (!weather || !Number.isFinite(Number(weather.temperature))) return "";

  const parts = [`${weather.temperature}°C`];

  if (Number.isFinite(Number(weather.humidity))) {
    parts.push(`umidade ${weather.humidity}%`);
  }

  if (Number.isFinite(Number(weather.windSpeed))) {
    parts.push(`vento ${weather.windSpeed} km/h`);
  }

  return parts.join(", ");
}

function buildConversationHistory(messages = []) {
  return messages
    .slice(-8)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: String(message.content || "") }],
    }));
}

async function fetchWeather(deviceLocation) {
  if (!isTruthyLocation(deviceLocation)) return null;

  try {
    const weatherData = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${deviceLocation.lat}&longitude=${deviceLocation.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );

    const current = weatherData.current || {};
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      time: current.time,
    };
  } catch {
    return null;
  }
}

async function geocodeDestination(destinationText) {
  const safeDestination = String(destinationText || "").trim();
  if (!safeDestination) return null;

  try {
    const geo = await fetchJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
        safeDestination
      )}`,
      {
        headers: {
          "User-Agent": "MeganOS/1.0",
          Accept: "application/json",
        },
      }
    );

    const first = geo?.[0];
    if (!first) return null;

    return {
      label: first.display_name,
      latitude: Number(first.lat),
      longitude: Number(first.lon),
      lat: Number(first.lat),
      lon: Number(first.lon),
    };
  } catch {
    return null;
  }
}

async function calculateRoute(deviceLocation, destinationResolved) {
  if (!isTruthyLocation(deviceLocation) || !destinationResolved) return null;

  try {
    const routeData = await fetchJson(
      `https://router.project-osrm.org/route/v1/driving/${deviceLocation.lon},${deviceLocation.lat};${destinationResolved.lon},${destinationResolved.lat}?overview=full&geometries=geojson&steps=true`
    );

    const foundRoute = routeData.routes?.[0];
    if (!foundRoute) return null;

    return {
      distance: foundRoute.distance,
      duration: foundRoute.duration,
      geometry: foundRoute.geometry,
      steps: foundRoute.legs?.[0]?.steps || [],
    };
  } catch {
    return null;
  }
}

function buildRuleBasedReply({
  text,
  intent,
  weather,
  destinationResolved,
  route,
  hasLocation,
}) {
  if (intent === "greeting") {
    if (weather) {
      return `Oi, Luiz. Estou pronta. No seu local agora está ${summarizeWeather(weather)}.`;
    }
    return "Oi, Luiz. Estou pronta para ajudar.";
  }

  if (intent === "weather") {
    if (!hasLocation) {
      return "Ative sua localização para eu te informar o clima atual com precisão.";
    }

    if (!weather) {
      return "Não consegui consultar o clima agora. Tente novamente em instantes.";
    }

    return `No seu local agora está ${summarizeWeather(weather)}.`;
  }

  if (intent === "map") {
    if (destinationResolved && route) {
      return `Abrindo o mapa com a rota para ${destinationResolved.label}. Distância ${formatDistance(
        route.distance
      )} e tempo estimado ${formatDuration(route.duration)}.`;
    }

    if (destinationResolved && !route) {
      return `Abrindo o mapa para ${destinationResolved.label}. Ainda não consegui calcular a rota completa.`;
    }

    return "Abrindo o mapa. Se quiser, me diga também o destino para eu iniciar a navegação.";
  }

  if (intent === "navigation") {
    if (!destinationResolved) {
      return "Não consegui identificar o destino com precisão. Me envie o endereço ou nome do local com mais detalhes.";
    }

    if (!hasLocation) {
      return `Encontrei o destino ${destinationResolved.label}, mas preciso da sua localização ativa para calcular a rota.`;
    }

    if (!route) {
      return `Encontrei o destino ${destinationResolved.label}, mas não consegui calcular a rota completa agora.`;
    }

    const firstInstruction =
      route.steps.find((step) => step?.maneuver?.instruction)?.maneuver?.instruction || "";

    return [
      `Rota pronta para ${destinationResolved.label}.`,
      `Distância ${formatDistance(route.distance)} e tempo estimado ${formatDuration(route.duration)}.`,
      firstInstruction ? `Primeira instrução: ${firstInstruction}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (weather && !destinationResolved) {
    return `Entendi. No seu local agora está ${summarizeWeather(weather)}. Como posso te ajudar a seguir?`;
  }

  return `Entendi. Como quer que eu continue com isso: ${text}?`;
}

async function generateGeminiReply({
  conversation,
  text,
  intent,
  weather,
  destinationResolved,
  route,
  hasLocation,
  mapRequested,
  context,
}) {
  if (!GEMINI_API_KEY) return "";

  const toolSummary = {
    intent,
    hasLocation,
    mapRequested,
    weather: weather
      ? {
          summary: summarizeWeather(weather),
          raw: weather,
        }
      : null,
    destinationResolved: destinationResolved
      ? {
          label: destinationResolved.label,
          latitude: destinationResolved.latitude,
          longitude: destinationResolved.longitude,
        }
      : null,
    route: route
      ? {
          distanceText: formatDistance(route.distance),
          durationText: formatDuration(route.duration),
          firstInstruction:
            route.steps.find((step) => step?.maneuver?.instruction)?.maneuver?.instruction || "",
        }
      : null,
    memoryContext: context || null,
  };

  const systemInstruction = `
Você é Megan OS, assistente em português do Brasil.
Responda de forma natural, útil, direta e humana.
Evite frases robóticas.
Não repita "Você disse".
Não despeje clima ou rota se isso não ajudar.
Quando houver rota pronta, confirme de forma curta e clara.
Quando faltar informação, peça apenas o dado necessário.
Quando a intenção for mapa, diga que vai abrir o mapa.
Use o contexto recente da conversa para manter continuidade.
No máximo 4 frases curtas.
`;

  const contents = [
    ...buildConversationHistory(conversation?.messages || []),
    {
      role: "user",
      parts: [
        {
          text: [
            `Mensagem atual do usuário: ${text}`,
            `Resumo das ferramentas e memória: ${JSON.stringify(toolSummary, null, 2)}`,
          ].join("\n\n"),
        },
      ],
    },
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.5,
            topP: 0.9,
            maxOutputTokens: 220,
          },
        }),
      }
    );

    if (!response.ok) return "";

    const data = await response.json();
    return (
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("")
        .trim() || ""
    );
  } catch {
    return "";
  }
}

export {
  formatDistance,
  formatDuration,
  isTruthyLocation,
  summarizeWeather,
  fetchWeather,
  geocodeDestination,
  calculateRoute,
  buildRuleBasedReply,
  generateGeminiReply,
};