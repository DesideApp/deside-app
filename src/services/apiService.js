import API_BASE_URL from "../config/apiConfig.js";
import { getCSRFTokenFromCookie, refreshToken, clearSession } from "./tokenService.js";

const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 */
export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // ✅ Verificar caché antes de hacer la solicitud
    if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp <= CACHE_EXPIRATION) {
            console.log(`⚡ Usando caché para ${endpoint}`);
            return cachedData.data;
        }
        cache.delete(cacheKey); // ❌ Expirar caché si ha pasado el tiempo límite
    }

    try {
        const csrfToken = getCSRFTokenFromCookie();
        const headers = {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include",
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) {
                console.warn("⚠️ Token expirado. Intentando renovar...");
                const refreshed = await refreshToken();

                if (!refreshed) {
                    console.warn("❌ No se pudo renovar el token. Cerrando sesión...");
                    clearSession();
                    throw new Error("Sesión expirada. Reautenticación requerida.");
                }

                return apiRequest(endpoint, options, false); // 🔄 Reintentar sin loop infinito
            }

            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() }); // ✅ Solo cacheamos respuestas exitosas
        return responseData;
    } catch (error) {
        console.error(`❌ Error en API request (${endpoint}):`, error.message || error);
        throw error;
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
    return apiRequest("/api/auth/status", { method: "GET" });
}

export async function logout() {
    clearSession();
    return apiRequest("/api/auth/revoke", { method: "POST" });
}

/**
 * 🔹 **Funciones de contactos**
 */
export async function getContacts() {
    return apiRequest("/api/contacts", { method: "GET" });
}

export async function addContact(pubkey) {
    return apiRequest("/api/contacts/send", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

export async function approveContact(pubkey) {
    return apiRequest("/api/contacts/accept", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

export async function rejectContact(pubkey) {
    return apiRequest("/api/contacts/remove", {
        method: "DELETE",
        body: JSON.stringify({ pubkey }),
    });
}

/**
 * 🔹 **Funciones de Solana (llamadas al backend, no a la blockchain)**
 */
export async function getSolanaPrice() {
    return apiRequest("/api/solana/solana-price", { method: "GET" });
}

export async function getSolanaTPS() {
    return apiRequest("/api/solana/solana-tps", { method: "GET" });
}

export async function getSolanaStatus() {
    return apiRequest("/api/solana/solana-status", { method: "GET" });
}

export async function verifyTransaction(signature) {
    return apiRequest(`/api/solana/verify-transaction/${signature}`, { method: "GET" });
}
