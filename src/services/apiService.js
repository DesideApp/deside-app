import API_BASE_URL from '../config/apiConfig.js';
import { getToken, refreshToken } from '../services/tokenService.js';

const cache = new Map();

// Función para hacer las solicitudes a la API
export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Verificamos si el resultado ya está en caché
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    try {
        const token = getToken(); // 🔹 Corregido, usamos getToken() en lugar de getAccessToken()
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers, // Se agregan encabezados adicionales si los hay
        };

        // Hacer la solicitud fetch
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Si la respuesta no es OK (por ejemplo, 401), intentamos renovar el token
        if (!response.ok) {
            if (response.status === 401 && retry) {
                await refreshToken(); // Intentamos renovar el token
                return apiRequest(endpoint, options, false); // Reintentar la solicitud
            }
            const errorData = await response.json();
            throw new Error(`Request failed: ${response.status} - ${errorData.message || response.statusText}`);
        }

        // Obtener y almacenar los datos de la respuesta
        const responseData = await response.json();
        cache.set(cacheKey, responseData); // Guardamos la respuesta en caché
        return responseData;

    } catch (error) {
        console.error(`Error in API request to ${endpoint}:`, error);
        throw error; // Lanzamos el error si ocurre alguna excepción
    }
}

// 🔹 Corregido: Obtener contactos correctamente
export async function getContacts() {
    return apiRequest('/api/contacts', { method: 'GET' });
}

// 🔹 Corregido: Enviar solicitud de contacto (URL correcta)
export async function addContact(pubkey) {
    return apiRequest('/api/contacts/send', {
        method: 'POST',
        body: JSON.stringify({ pubkey }),
    });
}

// 🔹 Aceptar contacto correctamente
export async function acceptContact(pubkey) {
    return apiRequest('/api/contacts/accept', {
        method: 'POST',
        body: JSON.stringify({ pubkey }),
    });
}

// 🔹 Corregido: Rechazar contacto eliminándolo correctamente
export async function rejectContact(pubkey) {
    return apiRequest('/api/contacts/remove', {
        method: 'DELETE', // 🔹 Cambiado de POST a DELETE
        body: JSON.stringify({ pubkey }),
    });
}
