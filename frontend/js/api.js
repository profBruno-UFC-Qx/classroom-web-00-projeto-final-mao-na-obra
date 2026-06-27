const API_URL = "http://localhost:1337/api";
const AUTH_TOKEN_KEY = "contrataki_jwt";
const AUTH_USER_KEY = "contrataki_user";
const AUTH_PROFILE_KEY = "contrataki_profile";

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

function getStoredUser() {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

function getStoredProfile() {
  const storedProfile = localStorage.getItem(AUTH_PROFILE_KEY);
  return storedProfile ? JSON.parse(storedProfile) : null;
}

function saveAuthSession(user, token, profile = null) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (profile) {
    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
  }
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}

function isAuthenticated() {
  return Boolean(getStoredToken());
}

function redirectIfUnauthenticated(allowedPaths = []) {
  const currentPath = window.location.pathname;
  const isAllowedPath = allowedPaths.some((path) => currentPath.includes(path));

  if (!isAuthenticated() && !isAllowedPath) {
    window.location.href = "login.html";
  }
}

function getAuthHeaders() {
  const headers = { Accept: "application/json" };
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload?.error?.message || "Não foi possível completar a requisição.",
    );
  }

  return payload;
}

async function getJson(path) {
  return requestJson(path, { method: "GET" });
}

async function postJson(path, body) {
  return requestJson(path, { method: "POST", body: JSON.stringify(body) });
}

async function putJson(path, body) {
  return requestJson(path, { method: "PUT", body: JSON.stringify(body) });
}

async function deleteJson(path) {
  return requestJson(path, { method: "DELETE" });
}

function showFeedback(container, message, type = "success") {
  if (!container) {
    return;
  }

  const existing = container.querySelector(".feedback-message");
  if (existing) {
    existing.remove();
  }

  const feedback = document.createElement("div");
  feedback.className = `feedback-message alert ${type === "error" ? "alert-danger" : "alert-success"} mt-3`;
  feedback.textContent = message;
  container.prepend(feedback);
}

function formatDate(value) {
  if (!value) {
    return "Não informada";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
  if (!value) {
    return "Não informada";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function normalizeStatus(status) {
  const map = {
    PENDENTE: "Pendente",
    ACEITA: "Aceito",
    RECUSADA: "Cancelado",
    CONCLUIDA: "Concluído",
  };

  return map[status] || status || "Não informado";
}

function getStatusClass(status) {
  if (status === "ACEITA") {
    return "status-aceito";
  }
  if (status === "CONCLUIDA") {
    return "status-concluido";
  }
  if (status === "RECUSADA") {
    return "status-cancelado";
  }
  return "status-pendente";
}

function getStatusBadgeClass(status) {
  if (status === "ACEITA") {
    return "bg-success";
  }
  if (status === "CONCLUIDA") {
    return "bg-primary";
  }
  if (status === "RECUSADA") {
    return "bg-secondary";
  }
  return "bg-warning text-dark";
}

function getNestedValue(item, path) {
  return path.reduce((accumulator, key) => accumulator?.[key], item);
}

function stripHtml(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.replace(/<[^>]+>/g, "").trim();
  }

  return "";
}

function getMediaUrl(value) {
  if (!value) {
    return "https://picsum.photos/150";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length) {
    return value[0]?.url
      ? `${API_URL}${value[0].url}`
      : "https://picsum.photos/150";
  }

  return "https://picsum.photos/150";
}
