import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken, getCsrfToken, refreshToken } from '../services/tokenService.js'; // Import refreshToken function

const cache = new Map(); // Caché simple utilizando Map

export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    // Verificar si la respuesta está en la caché
    if (cache.has(cacheKey)) {
        console.log('Returning cached response for:', endpoint);
        return cache.get(cacheKey);
    }

    const csrfToken = getCsrfToken();
    const token = await getAccessToken(); // Obtén el access token válido

    console.log('JWT Token:', token);
    console.log('CSRF Token:', csrfToken);

    if (!csrfToken || !token) {
        console.error('CSRF or Access Token is missing');
        throw new Error('CSRF or Access Token is missing');
    }

    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
    console.log('CSRF Token:', csrfToken);
    console.log('Access Token:', token);

    const headers = {
        'Content-Type': 'application/json', // Ensure Content-Type is set to JSON
        ...options.headers,
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;

    console.log('Authorization Header:', token ? `Bearer ${token}` : 'No token');
    console.log('CSRF Header:', csrfToken || 'No CSRF Token');
    console.log('Headers enviados:', headers);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && retry) { // Token expirado o inválido
                console.warn('Access token expired, attempting to refresh...');
                await refreshToken(); // Renueva el token
                return apiRequest(endpoint, options, false); // Reintenta la solicitud
            }
            const errorData = await response.json();
            console.error('API request failed:', response.statusText, errorData);
            throw new Error(`Request failed: ${response.statusText}`);
        }

        const responseData = await response.json();
        console.log('API response data:', responseData);

        // Almacenar la respuesta en la caché
        cache.set(cacheKey, responseData);

        return responseData;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}
