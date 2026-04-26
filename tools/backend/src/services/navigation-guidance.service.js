export function buildNavigationGuidance({ destination = '', navigationState = {}, route = null } = {}) {
  const safeDestination = String(destination || '').trim();

  if (!safeDestination) {
    return {
      ok: true,
      mode: 'navigation-guidance',
      step: 'await_destination',
      instruction: 'Informe um destino para eu iniciar o copiloto.',
      etaText: null,
    };
  }

  if (!navigationState?.hasLocation) {
    return {
      ok: true,
      mode: 'navigation-guidance',
      step: 'await_location',
      instruction: `Destino identificado: ${safeDestination}. Agora preciso da sua localização atual para começar a rota.`,
      etaText: null,
    };
  }

  if (route?.summary === 'route_executed') {
    return {
      ok: true,
      mode: 'navigation-guidance',
      step: 'route_ready',
      instruction: `Rota pronta para ${safeDestination}. Vou acompanhar seu deslocamento como copiloto.`,
      etaText: 'ETA em cálculo local',
    };
  }

  return {
    ok: true,
    mode: 'navigation-guidance',
    step: 'route_processing',
    instruction: `Estou processando a navegação para ${safeDestination}.`,
    etaText: null,
  };
}
