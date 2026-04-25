function normalizeText(value) {
  return String(value || '').trim();
}

function lower(value) {
  return normalizeText(value).toLowerCase();
}

function recentMessages(conversation, limit = 8) {
  return Array.isArray(conversation?.messages) ? conversation.messages.slice(-limit) : [];
}

function baseCandidate(type, score, reason) {
  return { type, score, reason };
}

export function predictNextAction(context = {}) {
  const text = lower(context.text);
  const destinationText = normalizeText(context.destinationText);
  const hasLocation = Boolean(context.deviceLocation);
  const hasRoute = Boolean(context.route);
  const hasDestination = Boolean(context.destinationResolved || destinationText);
  const recent = recentMessages(context.conversation);
  const contextPriority = context.contextPriority || {};
  const candidates = [];

  if (context.intent === 'navigation') {
    if (!hasDestination) {
      candidates.push(baseCandidate('provide_destination', 0.93, 'navigation_without_destination'));
    }
    if (!hasLocation) {
      candidates.push(baseCandidate('enable_location', 0.89, 'navigation_without_location'));
    }
    if (hasDestination && hasLocation && !hasRoute) {
      candidates.push(baseCandidate('retry_route', 0.87, 'route_missing_with_inputs_ready'));
    }
    if (hasRoute) {
      candidates.push(baseCandidate('continue_navigation', 0.94, 'route_ready'));
      candidates.push(baseCandidate('open_map', 0.76, 'map_is_useful_for_route'));
    }
  }

  if (context.intent === 'weather') {
    candidates.push(baseCandidate(hasLocation ? 'show_weather_now' : 'enable_location', hasLocation ? 0.84 : 0.78, hasLocation ? 'weather_with_location' : 'weather_without_location'));
  }

  if (/casa|trabalho|mercado|shopping/.test(text)) {
    candidates.push(baseCandidate('resolve_saved_place', 0.72, 'likely_alias_destination'));
  }

  const lastAssistant = recent.filter((item) => item?.role === 'assistant').slice(-1)[0];
  const assistantText = lower(lastAssistant?.content);
  if (/diga o destino|informe o destino/.test(assistantText)) {
    candidates.push(baseCandidate('provide_destination', 0.82, 'assistant_recently_requested_destination'));
  }
  if (/ative sua localiza/.test(assistantText)) {
    candidates.push(baseCandidate('enable_location', 0.8, 'assistant_recently_requested_location'));
  }

  if (contextPriority.navigationBoost >= 20) {
    candidates.push(baseCandidate('navigation_priority', 0.75, 'context_priority_navigation_boost'));
  }

  if (!candidates.length) {
    candidates.push(baseCandidate('continue_chat', 0.58, 'fallback'));
  }

  const merged = candidates
    .sort((a, b) => b.score - a.score)
    .filter((item, index, array) => array.findIndex((x) => x.type === item.type) === index)
    .slice(0, 5);

  return {
    topPrediction: merged[0],
    candidates: merged,
    confidence: merged[0]?.score || 0.5,
  };
}
