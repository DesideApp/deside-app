import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken } from './tokenService.js';

async function apiRequest(endpoint, options = {}) {
    const token = await getAccessToken(); // Obtén el access token válido
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`, // Incluye el access token en el encabezado
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('API request failed:', response.statusText, errorData);
        throw new Error(`Request failed: ${response.statusText}`);
    }

    return await response.json();
}

export { apiRequest };
