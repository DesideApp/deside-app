import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:5000";
const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 */
export async function apiRequest(endpoint, options = {}, useCache = false) {
  if (!endpoint) throw new Error("❌ API Request sin endpoint definido.");

  const requestUrl = `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;
  const cacheKey = `${requestUrl}:${JSON.stringify(options)}`;

  // ✅ Devolver de caché si está permitido y válido
  if (useCache && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (Date.now() - cachedData.timestamp <= CACHE_EXPIRATION) {
      console.log(`✅ Respuesta cacheada para ${requestUrl}`);
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

    // Si es respuesta vacía (204 No Content)
    if (response.status === 204) {
      return {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("⚠️ Sesión expirada. Se requiere login manual.");
        clearSession();
        return { isAuthenticated: false };
      }

      const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
      console.error(`❌ API error [${response.status}]:`, errorData.message);
      return {
        error: true,
        statusCode: response.status,
        message: errorData.message || response.statusText,
      };
    }

    const responseData = await response.json();
    if (useCache) cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return responseData;
  } catch (error) {
    console.error("❌ API Request error:", error.message);
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
