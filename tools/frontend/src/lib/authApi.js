import { getJson, postJson } from './api';

const TOKEN_STORAGE_KEY = 'megan_token';
const USER_STORAGE_KEY = 'megan_user';

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Evita quebrar a tela se o navegador bloquear storage.
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Evita quebrar logout em navegadores restritivos.
  }
}

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return safeGet(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const raw = safeGet(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    safeRemove(USER_STORAGE_KEY);
    return null;
  }
}

export function clearStoredSession() {
  safeRemove(TOKEN_STORAGE_KEY);
  safeRemove(USER_STORAGE_KEY);
}

export async function login(email, password) {
  const response = await postJson('/api/auth/login', { email, password });

  if (response?.token) {
    safeSet(TOKEN_STORAGE_KEY, response.token);
  }

  if (response?.user) {
    safeSet(USER_STORAGE_KEY, JSON.stringify(response.user));
  }

  return response;
}

export async function getSession() {
  const token = getStoredToken();

  if (!token) {
    clearStoredSession();
    return { ok: false, user: null };
  }

  const response = await getJson('/api/auth/session');

  if (response?.user) {
    safeSet(USER_STORAGE_KEY, JSON.stringify(response.user));
  }

  return response;
}

export async function logout() {
  try {
    if (getStoredToken()) {
      await postJson('/api/auth/logout', {});
    }
  } finally {
    clearStoredSession();
  }
}
