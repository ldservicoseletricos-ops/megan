function normalizeText(value) {
  return String(value || '').trim();
}

function lastAssistantMessages(conversation, limit = 6) {
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];
  return messages.filter((item) => item?.role === 'assistant').slice(-limit);
}

function countPattern(messages, regex) {
  return messages.reduce((total, item) => {
    const content = normalizeText(item?.content).toLowerCase();
    return regex.test(content) ? total + 1 : total;
  }, 0);
}

export function buildContextPriority(context = {}) {
  const intent = normalizeText(context.intent).toLowerCase() || 'general';
  const destinationText = normalizeText(context.destinationText);
  const hasLocation = Boolean(context.deviceLocation);
  const hasRoute = Boolean(context.route);
  const hasWeather = Boolean(context.weather);
  const repeatedFailures = Number(context.repeatedFailures || 0);
  const recentAssistant = lastAssistantMessages(context.conversation);

  const locationPrompts = countPattern(recentAssistant, /ative sua localiza[cç][aã]o|ligue sua localiza[cç][aã]o/);
  const destinationPrompts = countPattern(recentAssistant, /diga o destino|informe o destino/);
  const routeFailures = countPattern(recentAssistant, /n[aã]o consegui calcular a rota|rota ainda n[aã]o dispon[ií]vel/);

  let navigationBoost = 0;
  let weatherBoost = 0;
  let directReplyBoost = 0;
  let urgency = 'normal';
  const reasons = [];

  if (intent === 'navigation') {
    navigationBoost += 20;
    reasons.push('navigation_intent');
  }

  if (intent === 'weather') {
    weatherBoost += 16;
    reasons.push('weather_intent');
  }

  if (repeatedFailures >= 2) {
    navigationBoost += 10;
    directReplyBoost += 6;
    urgency = 'high';
    reasons.push('repeated_failures');
  }

  if (routeFailures >= 1) {
    navigationBoost += 8;
    directReplyBoost += 4;
    reasons.push('recent_route_failure');
  }

  if (destinationText && !context.destinationResolved) {
    directReplyBoost += 7;
    reasons.push('destination_resolution_failed');
  }

  if (!hasLocation && intent === 'navigation') {
    navigationBoost += 6;
    reasons.push('needs_location');
  }

  if (hasLocation && !hasWeather && intent === 'weather') {
    weatherBoost += 5;
    reasons.push('weather_pending_with_location');
  }

  if (locationPrompts >= 1 || destinationPrompts >= 1) {
    directReplyBoost += 4;
    reasons.push('avoid_repeated_questions');
  }

  if (hasRoute) {
    navigationBoost += 5;
    reasons.push('route_ready');
  }

  return {
    navigationBoost,
    weatherBoost,
    directReplyBoost,
    urgency,
    reasons,
    snapshot: {
      repeatedFailures,
      hasLocation,
      hasWeather,
      hasRoute,
      destinationTextProvided: Boolean(destinationText),
      locationPrompts,
      destinationPrompts,
      routeFailures,
    },
  };
}
