import API_BASE_URL from "../config/apiConfig.js";
import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 */
export async function apiRequest(endpoint, options = {}) {
    if (!endpoint) throw new Error("❌ API Request sin endpoint definido.");

    // ✅ Asegurar que la URL es válida
    const requestUrl = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
    
    const cacheKey = `${requestUrl}:${JSON.stringify(options)}`;

    // ✅ Verificar caché antes de hacer la solicitud
    if (cache.has(cacheKey)) {
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
                console.warn("⚠️ No autorizado. La sesión ha expirado.");
                
                const refreshed = await refreshToken();
                if (!refreshed) {
                    console.warn("❌ No se pudo renovar el token. Cerrando sesión.");
                    window.dispatchEvent(new Event("sessionExpired"));
                    clearSession();
                    return { isAuthenticated: false };
                }

                console.log("✅ Token renovado. Reintentando solicitud...");
                return await apiRequest(endpoint, options);
            }

            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        return responseData;
    } catch (error) {
        console.error(`❌ API Error (${requestUrl}):`, error.message || error);
        return { error: error.message || "Unknown API error" };
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
    try {
        const result = await apiRequest("/api/auth/status", { method: "GET" });

        if (!result.isAuthenticated) {
            console.warn("⚠️ Sesión no autenticada. Intentando refrescar el token...");
            const refreshed = await refreshToken();
            if (!refreshed) {
                console.warn("❌ No se pudo refrescar el token. Cerrando sesión.");
                window.dispatchEvent(new Event("sessionExpired"));
                clearSession();
                return { isAuthenticated: false };
            }
            return await apiRequest("/api/auth/status", { method: "GET" });
        }

        return result;
    } catch (error) {
        console.error("❌ Error en checkAuthStatus:", error);
        return { isAuthenticated: false };
    }
}

export async function logout() {
    try {
        const response = await apiRequest("/api/auth/revoke", { method: "POST" });

        if (!response || response.error) {
            console.error("❌ Error al hacer logout en el backend.");
            return { success: false };
        }

        clearSession();
        window.dispatchEvent(new Event("sessionExpired"));
        return { success: true };
    } catch (error) {
        console.error("❌ Error en logout:", error);
        return { success: false };
    }
}

/**
 * 🔹 **Refrescar Token de Sesión**
 */
let isRefreshingToken = false;

export async function refreshToken() {
    if (isRefreshingToken) {
        console.warn("⚠️ Ya hay un intento de refresco en curso. Esperando...");
        return false;
    }

    isRefreshingToken = true;
    try {
        console.log("🔄 Intentando refrescar token...");
        const response = await apiRequest("/api/auth/refresh", { method: "POST" });

        if (response.error) {
            console.warn("⚠️ No se pudo refrescar el token.");
            return false;
        }

        console.log("✅ Token refrescado con éxito.");
        window.dispatchEvent(new Event("sessionRefreshed"));
        return true;
    } catch (error) {
        console.error("❌ Error al refrescar token:", error);
        return false;
    } finally {
        isRefreshingToken = false; // ✅ Asegurar que siempre se desbloquea
    }
}
