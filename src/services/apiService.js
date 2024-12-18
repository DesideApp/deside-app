import API_BASE_URL from '../config/apiConfig.js';
import { getAccessToken, getCsrfToken, refreshToken } from '../services/tokenService.js';

const cache = new Map();

export async function apiRequest(endpoint, options = {}, retry = true) {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    
    if (cache.has(cacheKey)) {
        console.log('Returning cached response for:', endpoint);
        return cache.get(cacheKey);
    }

    const csrfToken = getCsrfToken();
    const token = await getAccessToken();

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
        'Content-Type': 'application/json',
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
