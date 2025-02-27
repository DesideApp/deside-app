import API_BASE_URL from "../config/apiConfig.js";
import { refreshToken, getCSRFTokenFromCookie } from "./tokenService.js";
import { ensureWalletState } from "./walletStateService.js";

const cache = new Map();
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

/**
 * 🔹 **Función central para manejar solicitudes a la API con autenticación y CSRF**
 */
export async function apiRequest(endpoint, options = {}, retry = true) {
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
        // ✅ Verificar autenticación solo si no es una solicitud pública
        if (!endpoint.includes("/public/")) {
            const { isAuthenticated } = await ensureWalletState();
            if (!isAuthenticated) {
                throw new Error("❌ Wallet no autenticada. No se puede hacer la solicitud.");
            }
        }

        let csrfToken = getCSRFTokenFromCookie();

        // ✅ Construcción segura de headers
        const headers = {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include", // ✅ Asegurar que se envían cookies
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) {
                console.warn("⚠️ Token expirado. Intentando renovación...");
                await refreshToken(); // 🔄 Renovamos el token
                return apiRequest(endpoint, options, false); // 🔄 Reintentar con nuevo token
            }

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
 * 🔹 **Funciones específicas para interacciones con la API**
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
