import { apiRequest } from '../services/apiService.js';
import { setToken, removeToken, getToken } from '../services/tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';
import nacl from 'tweetnacl';

let token = null;

async function initializeToken() {
    try {
        const existingToken = getToken();
        if (existingToken) return existingToken; // No inicializar si ya hay un token válido

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey: 'default_pubkey' }),
        });

        if (!response.ok) {
            throw new Error('Error al obtener token inicial');
        }

        const data = await response.json();
        token = data.token;
        setToken(token);
        return token;
    } catch (error) {
        throw error;
    }
}

async function refreshToken() {
    try {
        const response = await apiRequest('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        setToken(data.token);
        return data.token;
    } catch (error) {
        logout();
        throw new Error('Session renewal failed. Please log in again.');
    }
}

async function fetchWithAuth(url, options = {}) {
    token = getToken() || await initializeToken();
    
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (response.status === 403) {
        token = await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken };

export async function loginWithSignature(pubkey, signature, message) {
    try {
        const response = await apiRequest('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!response.ok) {
            throw new Error('Failed to verify signature.');
        }

        const data = await response.json();
        setToken(data.token);
        return data.token;
    } catch (error) {
        throw new Error('Error during login with signature: ' + error.message);
    }
}

export function logout() {
    removeToken();
}

export async function register(pubkey, signature, message) {
    try {
        const isSignatureValid = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            Uint8Array.from(signature),
            Uint8Array.from(Buffer.from(pubkey, 'base64'))
        );

        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, isSignatureValid }),
        });

        return response;
    } catch (error) {
        throw new Error('Registration failed. Please check your details and try again.');
    }
}
