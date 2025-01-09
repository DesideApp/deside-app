import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken, refreshToken } from '../services/tokenService.js';

const cache = new Map();

export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
        console.log('Returning cached response for:', endpoint);
        return cache.get(cacheKey);
    }

    const token = await getAccessToken();

    if (!token) {
        console.error('Access Token is missing');
        throw new Error('Access Token is missing');
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) {
                await refreshToken();
                return apiRequest(endpoint, options, false);
            }
            const errorData = await response.json();
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        cache.set(cacheKey, responseData);
        return responseData;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Funciones específicas para cada tipo de solicitud
export async function getContacts() {
    return apiRequest('/api/contacts', { method: 'GET' });
}

export async function addContact(contact) {
    return apiRequest('/api/contacts/add', {
        method: 'POST',
        body: JSON.stringify(contact),
    });
}

export async function acceptContact(pubkey) {
    return apiRequest('/api/contacts/accept', {
        method: 'POST',
        body: JSON.stringify({ pubkey }),
    });
}

export async function rejectContact(pubkey) {
    return apiRequest('/api/contacts/reject', {
        method: 'POST',
        body: JSON.stringify({ pubkey }),
    });
}
