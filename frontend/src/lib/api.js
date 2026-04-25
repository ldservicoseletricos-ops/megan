const DEFAULT_API_URL = "http://localhost:10000";

function getBaseUrl() {
  const envUrl = import.meta?.env?.VITE_API_URL;

  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).replace(/\/$/, "");
  }

  return DEFAULT_API_URL;
}

export const API_BASE_URL = getBaseUrl();

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
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
      `Erro ${response.status}`
    );
  }

  return data;
}

/* novos nomes */
export const apiGet = (path) =>
  request(path, { method: "GET" });

export const apiPost = (path, body = {}) =>
  request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPut = (path, body = {}) =>
  request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiDelete = (path) =>
  request(path, { method: "DELETE" });

/* compatibilidade antiga */
export const getJson = apiGet;
export const postJson = apiPost;
export const putJson = apiPut;
export const deleteJson = apiDelete;

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  getJson,
  postJson,
  putJson,
  deleteJson,
};