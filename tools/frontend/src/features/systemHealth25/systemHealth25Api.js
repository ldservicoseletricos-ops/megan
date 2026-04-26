import { apiGet } from '../../lib/api';

export function getSystemHealth25Status() {
  return apiGet('/api/system-health-25/status');
}
