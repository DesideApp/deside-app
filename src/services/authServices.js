import { getToken, setToken, removeToken, getRefreshToken, refreshToken } from './tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';

// 🚀 1️⃣ **Inicializar Token de sesión**
export async function initializeToken() {
    const existingToken = getToken();
    if (existingToken) return existingToken;

    console.warn("🔴 No token found, requesting a new one...");

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey: 'default_pubkey' }),
        });

        if (!response.ok) throw new Error('Error al obtener token inicial');

        const { token, refreshToken } = await response.json();
        setToken(token, refreshToken);
        return token;
    } catch (error) {
        console.error("❌ Error en `initializeToken()`:", error);
        throw error;
    }
}

// 🚀 2️⃣ **Peticiones con autenticación**
export async function fetchWithAuth(url, options = {}) {
    let token = getToken() || await initializeToken();

    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };

    const response = await fetch(url, options);

    if (response.status === 403) {
        console.warn("⚠️ Token inválido, intentando renovar...");
        token = await refreshToken();
        if (!token) return response; 

        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

// 🚀 3️⃣ **Autenticación con Wallet**
export async function authenticateWithServer(pubkey, signature, message) {
    try {
        console.log("🔵 Enviando autenticación con:", { pubkey, signature, message });

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!response.ok) throw new Error("❌ Fallo en autenticación");

        const { token, refreshToken } = await response.json();
        setToken(token, refreshToken);
        return token;
    } catch (error) {
        console.error("❌ Error en `authenticateWithServer()`:", error);
        throw error;
    }
}

// 🚀 4️⃣ **Cerrar sesión segura**
export function logout() {
    removeToken();
    console.info("🔵 Usuario deslogueado correctamente.");
}

// 🚀 5️⃣ **Registro Seguro**
export async function register(pubkey, signature, message) {
    try {
        if (!pubkey || !signature || !message) throw new Error("🔴 Faltan parámetros en el registro.");

        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!response.ok) throw new Error("❌ Fallo en el registro");

        const data = await response.json();
        console.log("✅ Usuario registrado con éxito:", data);
        return data;
    } catch (error) {
        console.error("❌ Error en `register()`:", error);
        throw error;
    }
}
