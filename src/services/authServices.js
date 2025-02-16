import { getToken, setToken, removeToken, refreshToken } from './tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';

// 🚀 **Peticiones con autenticación**
export async function fetchWithAuth(url, options = {}) {
    let token = getToken();
    if (!token) {
        console.warn("🔴 No se encontró un token válido, intentando renovar...");
        token = await refreshToken();
        if (!token) throw new Error("❌ No se pudo renovar el token.");
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

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

// 🚀 **Autenticación con Wallet**
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

// 🚀 **Cerrar sesión segura**
export function logout() {
    removeToken();
    console.info("🔵 Usuario deslogueado correctamente.");
}

// 🚀 **Registro Seguro**
export async function registerWallet(pubkey) {
    try {
        if (!pubkey) throw new Error("🔴 Faltan parámetros en el registro.");

        const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/register-wallet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey }),
        });

        if (!response.ok) throw new Error("❌ Fallo en el registro de la wallet");

        const data = await response.json();
        console.log("✅ Wallet registrada con éxito:", data);
        return data;
    } catch (error) {
        console.error("❌ Error en `registerWallet()`:", error);
        throw error;
    }
}
