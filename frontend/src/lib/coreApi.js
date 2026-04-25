import { apiGet, apiPost } from './api';
export const coreApi = {
  status: () => apiGet('/api/core/status'),
  dashboard: () => apiGet('/api/core/dashboard'),
  priorities: () => apiGet('/api/core/priorities'),
  recommendations: () => apiGet('/api/core/recommendations'),
  context: () => apiGet('/api/core/context/live'),
  execute: (payload) => apiPost('/api/core/execute', payload),
};
