import { apiRequest } from '../services/apiService.js';
import { setToken, removeToken, getToken } from '../services/tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';
import nacl from 'tweetnacl'; // Importar nacl para la verificación de firmas

let token = null;

async function initializeToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'deside.w3app@gmail.com' }),
        });

        if (!response.ok) {
            throw new Error('Error al obtener token inicial');
        }

        const data = await response.json();
        token = data.token;
        setToken(token);
    } catch (error) {
        throw error;
    }
}

async function refreshToken() {
    try {
        const response = await apiRequest('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setToken(response.token);
        return response.token;
    } catch (error) {
        logout();
        throw new Error('Session renewal failed. Please log in again.');
    }
}

async function fetchWithAuth(url, options = {}) {
    if (!token) {
        await initializeToken();
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (response.status === 403) {
        await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken };

function validateCredentials(username, password) {
    if (!username || !password) {
        throw new Error('Username and password are required.');
    }
}

function validateRegistrationData(pubkey, signature, message) {
    if (!pubkey || !signature || !message) {
        throw new Error('Public key, signature, and message are required.');
    }
}

function verifySignature(message, signature, pubkey) {
    const encodedMessage = new TextEncoder().encode(message);
    const signatureUint8 = Uint8Array.from(signature);
    const pubkeyUint8 = Uint8Array.from(Buffer.from(pubkey, 'base64'));
    return nacl.sign.detached.verify(encodedMessage, signatureUint8, pubkeyUint8);
}

export async function login(username, password) {
    try {
        validateCredentials(username, password);

        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const { token } = response;
        setToken(token);
        return response;
    } catch (error) {
        throw new Error('Login failed. Please check your credentials and try again.');
    }
}

export async function loginWithSignature(pubkey, signature, message) {
    try {
        const response = await apiRequest('/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        validateRegistrationData(pubkey, signature, message);
        const isSignatureValid = verifySignature(message, signature, pubkey);

        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pubkey, isSignatureValid }),
        });

        return response;
    } catch (error) {
        throw new Error('Registration failed. Please check your details and try again.');
    }
}

export const fetchToken = async (username) => {
    try {
        const response = await apiRequest('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        if (response.token) {
            setToken(response.token);
        }
    } catch (error) {
        throw error;
    }
};
