import { getJson, postJson } from './api';

export async function login(email, password) {
  const response = await postJson('/api/auth/login', { email, password });
  localStorage.setItem('megan_token', response.token);
  return response;
}

export async function getSession() { return getJson('/api/auth/session'); }

export async function logout() {
  try { await postJson('/api/auth/logout', {}); } finally { localStorage.removeItem('megan_token'); }
}
