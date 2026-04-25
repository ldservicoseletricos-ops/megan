function normalizeText(value) {
  return String(value || "").trim();
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function hasDestination(destinationText) {
  return Boolean(normalizeText(destinationText));
}

function hasLocation(deviceLocation) {
  return Boolean(
    deviceLocation &&
      Number.isFinite(Number(deviceLocation.lat)) &&
      Number.isFinite(Number(deviceLocation.lon))
  );
}

function classifyAction({
  text,
  intent,
  destinationText,
  deviceLocation,
  destinationResolved,
  route,
  weather,
}) {
  const safeText = normalizeText(text);
  const safeLowerText = lower(safeText);
  const safeDestinationText = normalizeText(destinationText);

  const locationAvailable = hasLocation(deviceLocation);
  const destinationRequested = hasDestination(safeDestinationText);
  const destinationFound = Boolean(destinationResolved);
  const routeReady = Boolean(route);
  const weatherReady = Boolean(weather);

  const wantsWeather =
    intent === "weather" ||
    /(clima|tempo|temperatura|chuva|vai chover|previs[aã]o|umidade|vento|frio|calor|quente|sol|nublado)/.test(
      safeLowerText
    );

  const wantsMap =
    intent === "map" ||
    /(abrir mapa|mostrar mapa|ver mapa|mapa)/.test(safeLowerText);

  const wantsNavigation =
    intent === "navigation" ||
    destinationRequested ||
    /(rota|navega|ir para|vá para|va para|como chegar|me leve|levar para|trajeto|destino)/.test(
      safeLowerText
    );

  const result = {
    primaryAction: "reply",
    openMap: false,
    shouldFetchWeather: false,
    shouldResolveDestination: false,
    shouldCalculateRoute: false,
    requiresLocation: false,
    requiresDestination: false,
    assistantMode: "general",
    reason: "general",
  };

  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|opa|hey)\b/.test(safeLowerText)) {
    result.primaryAction = "greeting";
    result.assistantMode = "general";
    result.reason = "greeting";
    return result;
  }

  if (wantsNavigation) {
    result.primaryAction = "navigation";
    result.openMap = true;
    result.shouldResolveDestination = true;
    result.shouldCalculateRoute = true;
    result.assistantMode = "navigation";

    if (!destinationRequested) {
      result.requiresDestination = true;
      result.reason = "navigation_without_destination";
      return result;
    }

    if (!destinationFound) {
      result.requiresDestination = true;
      result.reason = "navigation_destination_not_found";
      return result;
    }

    if (!locationAvailable) {
      result.requiresLocation = true;
      result.reason = "navigation_without_location";
      return result;
    }

    if (!routeReady) {
      result.reason = "navigation_route_failed";
      return result;
    }

    result.primaryAction = "start_navigation";
    result.reason = "navigation_ready";
    return result;
  }

  if (wantsMap) {
    result.primaryAction = "map";
    result.openMap = true;
    result.assistantMode = "map";

    if (destinationRequested) {
      result.shouldResolveDestination = true;
    }

    result.reason = destinationRequested
      ? destinationFound
        ? "map_with_destination"
        : "map_destination_not_found"
      : "map_without_destination";

    return result;
  }

  if (wantsWeather) {
    result.primaryAction = "weather";
    result.shouldFetchWeather = true;
    result.assistantMode = "weather";
    result.requiresLocation = !locationAvailable;
    result.reason = locationAvailable
      ? weatherReady
        ? "weather_ready"
        : "weather_fetch_failed"
      : "weather_without_location";
    return result;
  }

  result.primaryAction = "reply";
  result.assistantMode = "general";
  result.reason = "general";
  return result;
}

export { classifyAction };