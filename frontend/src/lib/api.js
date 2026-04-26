const DEFAULT_API_URL = "https://megan-ai.onrender.com";
const TOKEN_STORAGE_KEY = "megan_token";

function getBaseUrl() {
  const envUrl = import.meta?.env?.VITE_API_URL;

  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).replace(/\/$/, "");
  }

  return DEFAULT_API_URL;
}

function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export const API_BASE_URL = getBaseUrl();

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getStoredToken();
  const customHeaders = options.headers || {};
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      data?.reason ||
      `Erro ${response.status}`
    );
  }

  return data;
}

export const apiFetch = request;
export const apiGet = (path) => request(path, { method: "GET" });
export const apiPost = (path, body = {}) =>
  request(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPut = (path, body = {}) =>
  request(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiDelete = (path) => request(path, { method: "DELETE" });

export const getJson = apiGet;
export const postJson = apiPost;
export const putJson = apiPut;
export const deleteJson = apiDelete;

export default {
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  getJson,
  postJson,
  putJson,
  deleteJson,
};