import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const API_BASE_URL = "https://backend-deside.onrender.com";
const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 * 🚀 Ahora no hace nada automático, solo devuelve respuestas
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
        clearSession(); // ❌ No se intenta refrescar, solo limpia la sesión.
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
 * 🔹 **Funciones de autenticación (manuales, sin auto-refresh)**
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
 * 🔹 **Consultar si una wallet está registrada**
 */
export async function checkWalletRegistration(pubkey) {
  if (!pubkey) {
    console.warn("⚠️ No se proporcionó clave pública para verificar registro.");
    return { registered: false, error: "No public key provided." };
  }

  const response = await apiRequest(`/api/auth/registered/${pubkey}`, { method: "GET" });

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

/**
 * 🔹 **Refrescar Token de Sesión (manual, solo si otro componente lo llama)**
 */
export async function refreshToken() {
  try {
    console.debug("🔄 Intentando refrescar token manualmente...");
    const response = await apiRequest("/api/auth/refresh", { method: "POST" });

    if (response.error) {
      console.warn("⚠️ No se pudo refrescar el token.");
      return false;
    }

    console.debug("✅ Token refrescado con éxito.");
    return true;
  } catch {
    return false;
  }
}
