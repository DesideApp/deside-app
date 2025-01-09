import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken, refreshToken } from '../services/tokenService.js';

const cache = new Map();

export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;

    // Revisa si la respuesta ya está en el caché
    if (cache.has(cacheKey)) {
        console.log('Returning cached response for:', endpoint);
        return cache.get(cacheKey);
    }

    // Obtén el token de acceso
    const token = await getAccessToken();

    console.log('JWT Token:', token);

    if (!token) {
        console.error('Access Token is missing');
        throw new Error('Access Token is missing');
    }

    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            mode: 'cors', // Asegura que la solicitud utiliza CORS
        });

        if (!response.ok) {
            // Maneja el caso de token expirado
            if (response.status === 401 && retry) {
                console.warn('Access token expired, attempting to refresh...');
                await refreshToken(); // Refresca el token
                return apiRequest(endpoint, options, false); // Reintenta la solicitud
            }

            // Maneja errores del servidor
            if (response.status >= 500) {
                console.error('Server error:', response.status);
                throw new Error(`Server error: ${response.status}`);
            }

            const errorData = await response.json();
            console.error('API request failed:', response.statusText, errorData);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);

        // Guarda la respuesta en caché
        cache.set(cacheKey, responseData);

        return responseData;
    } catch (error) {
        // Manejo general de errores
        console.error('API request error:', error);

        // Devuelve un mensaje más amigable si es un problema de red
        if (error.name === 'TypeError') {
            throw new Error('Network error occurred. Please check your connection.');
        }

        throw error;
    }
}
