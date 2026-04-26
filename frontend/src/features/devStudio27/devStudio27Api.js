const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Falha na requisição ${path}`);
  }
  return data;
}

export function getDevStudio27Status() {
  return request('/api/dev-studio/status');
}

export function generateDevStudio27Plan(objective) {
  return request('/api/dev-studio/generate', {
    method: 'POST',
    body: JSON.stringify({ objective }),
  });
}
