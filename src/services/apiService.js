import API_BASE_URL from "../config/apiConfig.js";
import { getToken, refreshToken } from "./tokenService.js";
import { ensureWalletState } from "./walletStateService.js";

const cache = new Map();

// 🔹 **Función central para manejar solicitudes a la API**
export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // ✅ Si la respuesta está en caché, la devolvemos
    if (cache.has(cacheKey)) {
        console.log(`⚡ Usando caché para ${endpoint}`);
        return cache.get(cacheKey);
    }

    try {
        // Aseguramos que la wallet esté conectada y autenticada antes de hacer la solicitud
        const { isAuthenticated } = await ensureWalletState(); // 🔥 **Reutilizamos la lógica centralizada**
        if (!isAuthenticated) {
            throw new Error("❌ Wallet no autenticada. No se puede hacer la solicitud.");
        }

        let token = getToken();
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers, // ✅ Preservamos cualquier header adicional
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) {
                console.warn("⚠️ Token expirado. Intentando renovación...");
                await refreshToken(); // Renovamos el token
                return apiRequest(endpoint, options, false); // 🔄 Reintento con nuevo token
            }
            const errorData = await response.json();
            throw new Error(`❌ Error ${response.status}: ${errorData.message || response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, responseData); // ✅ Guardamos en caché
        return responseData;
    } catch (error) {
        console.error(`❌ Error en API request (${endpoint}):`, error);
        throw error;
    }
}

// 🔹 **Obtener contactos**
export async function getContacts() {
    return apiRequest("/api/contacts", { method: "GET" });
}

// 🔹 **Enviar solicitud de contacto**
export async function addContact(pubkey) {
    return apiRequest("/api/contacts/send", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

// 🔹 **Aceptar solicitud de contacto**
export async function approveContact(pubkey) {
    return apiRequest("/api/contacts/accept", {
        method: "POST",
        body: JSON.stringify({ pubkey }),
    });
}

// 🔹 **Rechazar o eliminar contacto**
export async function rejectContact(pubkey) {
    return apiRequest("/api/contacts/remove", {
        method: "DELETE",
        body: JSON.stringify({ pubkey }),
    });
}
