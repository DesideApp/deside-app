import API_BASE_URL from "../config/apiConfig.js";
import { getCSRFTokenFromCookie, clearSession } from "./tokenService.js";

const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Manejo centralizado de solicitudes a la API**
 */
export async function apiRequest(endpoint, options = {}) {
    if (!endpoint) throw new Error("❌ API Request sin endpoint definido.");

    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // ✅ Verificar caché antes de hacer la solicitud
    if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        if (Date.now() - cachedData.timestamp <= CACHE_EXPIRATION) {
            return cachedData.data;
        }
        cache.delete(cacheKey);
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
            if (response.status === 401) {
                console.warn("⚠️ No autorizado. Es posible que la sesión haya expirado.");
                throw new Error("Sesión expirada o no autenticado.");
            }

            const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        return responseData;
    } catch (error) {
        console.error(`❌ API Error (${endpoint}):`, error.message || error);
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
    try {
        return await apiRequest("/api/auth/status", { method: "GET" });
    } catch {
        return { isAuthenticated: false }; // ✅ No modificar la sesión, solo devolver estado
    }
}

export async function logout() {
    clearSession(); // ✅ Borra credenciales locales
    try {
        return await apiRequest("/api/auth/revoke", { method: "POST" });
    } catch {
        return null;
    }
}

/**
 * 🔹 **Funciones de contactos**
 */
export async function getContacts() {
    try {
        return await apiRequest("/api/contacts", { method: "GET" });
    } catch {
        return [];
    }
}

export async function addContact(pubkey) {
    try {
        return await apiRequest("/api/contacts/send", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
    } catch {
        return null;
    }
}

export async function approveContact(pubkey) {
    try {
        return await apiRequest("/api/contacts/accept", {
            method: "POST",
            body: JSON.stringify({ pubkey }),
        });
    } catch {
        return null;
    }
}

export async function rejectContact(pubkey) {
    try {
        return await apiRequest("/api/contacts/remove", {
            method: "DELETE",
            body: JSON.stringify({ pubkey }),
        });
    } catch {
        return null;
    }
}

/**
 * 🔹 **Funciones de Solana (llamadas al backend, no a la blockchain)**
 */
export async function getSolanaPrice() {
    try {
        return await apiRequest("/api/solana/solana-price", { method: "GET" });
    } catch {
        return null;
    }
}

export async function getSolanaTPS() {
    try {
        return await apiRequest("/api/solana/solana-tps", { method: "GET" });
    } catch {
        return null;
    }
}

export async function getSolanaStatus() {
    try {
        return await apiRequest("/api/solana/solana-status", { method: "GET" });
    } catch {
        return null;
    }
}

export async function verifyTransaction(signature) {
    try {
        return await apiRequest(`/api/solana/verify-transaction/${signature}`, { method: "GET" });
    } catch {
        return null;
    }
}
