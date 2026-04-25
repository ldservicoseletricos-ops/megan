export function buildUnifiedNavigationPanel({ destination = '', execution = {}, navigationState = {}, guidance = {}, traffic = {}, voice = {} } = {}) {
  return {
    ok: true,
    mode: 'unified-navigation-panel',
    panel: {
      destination: String(destination || '').trim(),
      status: navigationState?.status || 'idle',
      hasLocation: Boolean(navigationState?.hasLocation),
      routeReady: execution?.route?.summary === 'route_executed',
      weatherReady: execution?.weather?.summary === 'weather_executed',
      instruction: guidance?.instruction || '',
      alerts: traffic?.alerts || [],
      voice: voice?.voiceText || '',
      openMap: Boolean(execution?.route || execution?.effects?.openMap || navigationState?.destination),
      updatedAt: new Date().toISOString(),
    },
  };
}
