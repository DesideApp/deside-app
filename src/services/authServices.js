import { apiRequest } from '../services/apiService.js';
import { setToken, removeToken, getToken } from '../services/tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';
import nacl from 'tweetnacl';

let token = null;

async function initializeToken() {
    try {
        const existingToken = getToken();
        if (existingToken) return existingToken; // No solicitar uno nuevo si ya tenemos un token válido

        console.warn("🔴 No token found, requesting a new one...");

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
        console.error("🔴 Error en `initializeToken()`:", error);
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
        console.warn("🔴 Token expirado. Se requiere nuevo inicio de sesión.");
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
        console.warn("🔴 Token rechazado. Intentando renovar...");
        token = await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken };

export async function authenticateWithServer(pubkey, signature, message) {
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
        console.error("🔴 Error en `authenticateWithServer()`:", error);
        throw new Error('Error during authentication: ' + error.message);
    }
}

export function logout() {
    removeToken();
    console.info("🔵 Usuario deslogueado correctamente.");
}

export async function register(pubkey, signature, message) {
    try {
        if (!pubkey || !signature || !message) {
            throw new Error("🔴 Faltan parámetros en el registro.");
        }

        const isSignatureValid = nacl.sign.detached.verify(
            new TextEncoder().encode(message),
            Uint8Array.from(signature),
            Uint8Array.from(Buffer.from(pubkey, 'base64'))
        );

        if (!isSignatureValid) throw new Error("🔴 Firma inválida.");

        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, isSignatureValid }),
        });

        return response;
    } catch (error) {
        console.error("🔴 Error en `register()`:", error);
        throw new Error('Registration failed. Please check your details and try again.');
    }
}
