import { Router } from "express";

const router = Router();

function weatherCodeToText(code) {
  const map = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Névoa",
    48: "Névoa com geada",
    51: "Garoa fraca",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva fraca",
    63: "Chuva moderada",
    65: "Chuva forte",
    80: "Pancadas de chuva",
    95: "Trovoadas",
  };

  return map[code] || "Sem descrição";
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Falha ao consultar serviço externo (${response.status}).`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

// WEATHER
router.get("/weather", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ ok: false, error: "lat e lon são obrigatórios." });
    }

    const data = await fetchJson(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    );

    const current = data.current || {};

    return res.json({
      ok: true,
      weather: {
        temperature: current.temperature_2m ?? null,
        feelsLike: current.apparent_temperature ?? null,
        humidity: current.relative_humidity_2m ?? null,
        windSpeed: current.wind_speed_10m ?? null,
        weatherCode: current.weather_code ?? null,
        description: weatherCodeToText(current.weather_code),
        time: current.time ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// GEOCODE
router.get("/geocode", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ ok: false, error: "Consulta vazia." });

    const data = await fetchJson(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "MeganOS/1.0",
          Accept: "application/json",
        },
      }
    );

    const first = data?.[0];
    if (!first) {
      return res.json({ ok: true, item: null });
    }

    return res.json({
      ok: true,
      item: {
        label: first.display_name,
        latitude: Number(first.lat),
        longitude: Number(first.lon),
        lat: Number(first.lat),
        lon: Number(first.lon),
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// ROUTE
router.get("/route", async (req, res) => {
  try {
    const fromLat = Number(req.query.fromLat);
    const fromLon = Number(req.query.fromLon);
    const toLat = Number(req.query.toLat);
    const toLon = Number(req.query.toLon);

    if (![fromLat, fromLon, toLat, toLon].every(Number.isFinite)) {
      return res.status(400).json({ ok: false, error: "Coordenadas inválidas." });
    }

    const data = await fetchJson(
      `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&steps=true`
    );

    const route = data.routes?.[0];

    if (!route) {
      return res.json({ ok: true, route: null });
    }

    return res.json({
      ok: true,
      route: {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry,
        steps: route.legs?.[0]?.steps || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

export default router;