import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const API_BASE_URL = "https://backend-deside.onrender.com";
const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 */
export async function apiRequest(endpoint, options = {}, useCache = false) {
  if (!endpoint) throw new Error("❌ API Request sin endpoint definido.");
  const requestUrl = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  // ✅ Verificar caché solo si se permite
  const cacheKey = `${requestUrl}:${JSON.stringify(options)}`;
  if (useCache && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp <= CACHE_EXPIRATION) {
      return cachedData.data;
    }
  }

  try {
    const csrfToken = getCSRFTokenFromCookie();
    const headers = {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...options.headers,
    };

    const response = await fetch(requestUrl, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("⚠️ Sesión expirada. Se requiere login manual.");
        clearSession();
        return { isAuthenticated: false };
      }

      const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
      return { error: true, statusCode: response.status, message: errorData.message || response.statusText };
    }

    const responseData = await response.json();
    if (useCache) cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    return responseData;
  } catch (error) {
    return { error: true, message: error.message || "Error en la API" };
  }
}

/**
 * 🔹 **Autenticación con el servidor**
 */
export async function authenticateWithServer(pubkey, signature, message) {
  return apiRequest("/api/auth/auth", {
    method: "POST",
    body: JSON.stringify({ pubkey, signature, message }),
  });
}

/**
 * 🔹 **Verificación de autenticación SIN auto-refresh**
 */
export async function checkAuthStatus() {
  const result = await apiRequest("/api/auth/status", { method: "GET" });

  if (result?.isAuthenticated === false) {
    console.warn("⚠️ Sesión no autenticada. Se requiere login manual.");
    clearSession();
    return { isAuthenticated: false };
  }

  return result;
}

/**
 * 🔹 **Verificar si una wallet externa está registrada antes de agregarla como contacto**
 */
export async function checkWalletRegistered(pubkey) {
  if (!pubkey) {
    console.warn("⚠️ No se proporcionó clave pública para verificar registro.");
    return { registered: false, error: "No public key provided." };
  }

  const response = await apiRequest(`/api/contacts/check/${pubkey}`, { method: "GET" });

  if (response.error) {
    console.error("❌ Error consultando estado de wallet registrada:", response.message);
    return { registered: false, error: response.message };
  }

  return { registered: response.registered };
}

/**
 * 🔹 **Logout manual**
 */
export async function logout() {
  const response = await apiRequest("/api/auth/revoke", { method: "POST" });

  if (!response || response.error) {
    console.error("❌ Error al hacer logout en el backend.");
    return { success: false };
  }

  clearSession();
  return { success: true };
}