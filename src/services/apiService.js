import API_BASE_URL from "../config/apiConfig.js";
import { getCSRFTokenFromCookie } from "./tokenService.js";

const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Función central para manejar solicitudes a la API con autenticación y CSRF**
 */
export async function apiRequest(endpoint, options = {}) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // ✅ Verificar caché antes de hacer la solicitud
    if (cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        const isExpired = Date.now() - cachedData.timestamp > CACHE_EXPIRATION;
        if (!isExpired) {
            console.log(`⚡ Usando caché para ${endpoint}`);
            return cachedData.data;
        } else {
            cache.delete(cacheKey); // ❌ Expirar caché si ha pasado el tiempo límite
        }
    }

    try {
        let csrfToken = getCSRFTokenFromCookie();

        // ✅ Construcción segura de headers
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
            const errorData = await response.json();
            throw new Error(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, { data: responseData, timestamp: Date.now() }); // ✅ Guardamos en caché con timestamp
        return responseData;
    } catch (error) {
        console.error(`❌ Error en API request (${endpoint}):`, error);
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
