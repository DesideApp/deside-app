import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken, refreshToken } from '../services/tokenService.js';

const cache = new Map();

// Función genérica para realizar solicitudes a la API
export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
        console.log('Returning cached response for:', endpoint);
        return cache.get(cacheKey);
    }

    const token = await getAccessToken();

    console.log('JWT Token:', token);

    if (!token) {
        console.error('Access Token is missing');
        throw new Error('Access Token is missing');
    }

    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Access Token:', token);

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('Authorization Header:', token ? `Bearer ${token}` : 'No token');
    console.log('Headers enviados:', headers);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) {
                console.warn('Access token expired, attempting to refresh...');
                await refreshToken();
                return apiRequest(endpoint, options, false);
            }
            const errorData = await response.json();
            console.error('API request failed:', response.statusText, errorData);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);

        cache.set(cacheKey, responseData);

        return responseData;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Función para obtener contactos desde la API
export async function getContacts() {
    return apiRequest('/api/contacts');
}

// Función para agregar un contacto
export async function addContact(contact) {
    return apiRequest('/api/contacts/add', {
        method: 'POST',
        body: JSON.stringify(contact),
    });
}

// Función para aceptar una solicitud de contacto
export async function acceptContact(pubkey) {
    return apiRequest(`/api/contacts/accept/${pubkey}`, {
        method: 'POST',
    });
}

// Función para rechazar una solicitud de contacto
export async function rejectContact(pubkey) {
    return apiRequest(`/api/contacts/reject/${pubkey}`, {
        method: 'POST',
    });
}
