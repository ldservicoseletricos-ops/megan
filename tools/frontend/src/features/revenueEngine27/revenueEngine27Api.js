const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Erro ${response.status} ao chamar Revenue Engine 27`);
  return response.json();
}

export const revenueEngine27Api = {
  status: () => request('/api/revenue-engine-27/status'),
  dashboard: () => request('/api/revenue-engine-27/dashboard'),
  createOffer: (payload) => request('/api/revenue-engine-27/offers/create', { method: 'POST', body: JSON.stringify(payload || {}) }),
};
