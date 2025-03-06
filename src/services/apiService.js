import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const API_BASE_URL = "https://backend-deside.onrender.com"; // ✅ No depende de `VITE_BACKEND_URL`

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
        console.warn("⚠️ Sesión expirada, intentando renovar token...");
        const refreshed = await refreshToken();
        if (!refreshed) {
          clearSession();
          return { isAuthenticated: false };
        }
        return await apiRequest(endpoint, options, useCache);
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
 * 🔹 **Funciones de autenticación**
 */
export async function authenticateWithServer(pubkey, signature, message) {
  return apiRequest("/api/auth/auth", {
    method: "POST",
    body: JSON.stringify({ pubkey, signature, message }),
  });
}

export async function checkAuthStatus() {
  const result = await apiRequest("/api/auth/status", { method: "GET" });

  if (result?.isAuthenticated === false) {
    console.warn("⚠️ Sesión no autenticada. Intentando refrescar el token...");
    const refreshed = await refreshToken();
    if (!refreshed) {
      clearSession();
      return { isAuthenticated: false };
    }
    return await apiRequest("/api/auth/status", { method: "GET" });
  }

  return result;
}

export async function logout() {
  const response = await apiRequest("/api/auth/revoke", { method: "POST" });

  if (!response || response.error) {
    console.error("❌ Error al hacer logout en el backend.");
    return { success: false };
  }

  clearSession();
  return { success: true };
}

/**
 * 🔹 **Refrescar Token de Sesión**
 */
let isRefreshingToken = false;

export async function refreshToken() {
  if (isRefreshingToken) return false;

  isRefreshingToken = true;
  try {
    console.debug("🔄 Intentando refrescar token...");
    const response = await apiRequest("/api/auth/refresh", { method: "POST" });

    if (response.error) {
      console.warn("⚠️ No se pudo refrescar el token.");
      return false;
    }

    console.debug("✅ Token refrescado con éxito.");
    return true;
  } catch {
    return false;
  } finally {
    isRefreshingToken = false;
  }
}
