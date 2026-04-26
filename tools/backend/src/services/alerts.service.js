import { readAlerts, writeAlerts } from '../utils/file-state.js';
export const getAlerts = () => readAlerts();
export function createAlert(payload) {
  const alerts = readAlerts();
  const next = { id: `alert-${String(alerts.length + 1).padStart(3, '0')}`, level: payload.level || 'info', title: payload.title || 'Novo alerta', status: payload.status || 'open' };
  const all = [...alerts, next];
  writeAlerts(all);
  return next;
}
