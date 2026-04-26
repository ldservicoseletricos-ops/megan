export function buildTrafficAlerts({ route = null, location = null, weather = null } = {}) {
  const alerts = [];

  if (!location) {
    alerts.push({ level: 'info', code: 'location_missing', text: 'Sem localização ativa, alertas de trânsito limitados.' });
  }

  if (route?.summary === 'route_waiting_location') {
    alerts.push({ level: 'warning', code: 'route_waiting_location', text: 'Navegação aguardando GPS para calcular rota.' });
  }

  if (weather?.summary === 'weather_executed') {
    alerts.push({ level: 'info', code: 'weather_online', text: 'Condição climática monitorada para o trajeto.' });
  }

  return {
    ok: true,
    mode: 'traffic-alerts',
    alerts,
    hasCriticalAlert: alerts.some((item) => item.level === 'critical'),
  };
}
