const PRODUCTION_API_URL = "https://megan-ai.onrender.com";
const LOCAL_API_URL = "http://localhost:10000";
const TOKEN_STORAGE_KEY = "megan_token";

function isLocalHost(hostname) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function cleanUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

function getBaseUrl() {
  const envUrl = cleanUrl(import.meta?.env?.VITE_API_URL);

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined" && isLocalHost(window.location.hostname)) {
    return LOCAL_API_URL;
  }

  return PRODUCTION_API_URL;
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
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao backend em ${API_BASE_URL}. Verifique se o Render está online e se a URL da API está correta.`
    );
  }

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