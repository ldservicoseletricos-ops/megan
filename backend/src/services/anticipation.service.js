function normalizeText(value) {
  return String(value || '').trim();
}

export function buildAnticipation(context = {}) {
  const prediction = context.prediction?.topPrediction || null;
  const suggestions = [];

  if (!prediction) {
    return {
      summary: 'Nenhuma antecipação relevante agora.',
      suggestions,
      shouldPreloadMap: false,
    };
  }

  if (prediction.type === 'provide_destination') {
    suggestions.push('Você pode me mandar só o destino.');
  }

  if (prediction.type === 'enable_location') {
    suggestions.push('Ative a localização para eu seguir direto com a rota.');
  }

  if (prediction.type === 'retry_route') {
    suggestions.push('Posso tentar recalcular a rota automaticamente.');
  }

  if (prediction.type === 'continue_navigation') {
    suggestions.push('Mapa e navegação podem seguir sem perguntas extras.');
  }

  if (context.weather && context.intent === 'navigation') {
    suggestions.push('Também posso trazer o clima do caminho junto da rota.');
  }

  const shouldPreloadMap = Boolean(
    prediction.type === 'continue_navigation' ||
      prediction.type === 'retry_route' ||
      (prediction.type === 'provide_destination' && context.intent === 'navigation')
  );

  return {
    summary: suggestions[0] || 'Megan preparou o próximo passo mais provável.',
    suggestions,
    shouldPreloadMap,
  };
}
