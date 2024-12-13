import { getAccessToken } from './tokenService';

async function apiRequest(endpoint, options = {}) {
    const token = await getAccessToken(); // Obtén el access token válido
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`, // Incluye el access token en el encabezado
        },
    });

    if (!response.ok) {
        console.error('API request failed:', response.statusText);
        throw new Error('Request failed');
    }

    return await response.json();
}

export { apiRequest };
