import { apiRequest } from '../services/apiService.js';
import { setToken, removeToken, getToken } from '../services/tokenService.js';
import API_BASE_URL from '../config/apiConfig.js';
import nacl from 'tweetnacl';

let token = null;

// Inicializa el token si no hay uno activo
async function initializeToken() {
    try {
        const existingToken = getToken();
        if (existingToken) return existingToken; // Si ya hay un token válido, lo usamos

        console.warn("🔴 No token found, requesting a new one...");

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey: 'default_pubkey' }), // Aquí puedes cambiar el pubkey si es necesario
        });

        if (!response.ok) {
            throw new Error('Error al obtener token inicial');
        }

        const data = await response.json();
        token = data.token;
        setToken(token); // Guardamos el token
        return token;
    } catch (error) {
        console.error("🔴 Error en `initializeToken()`:", error);
        throw error;
    }
}

// Renovar el token cuando expira
async function refreshToken() {
    try {
        const response = await apiRequest('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        setToken(data.token); // Guardamos el nuevo token
        return data.token;
    } catch (error) {
        console.warn("🔴 Token expirado. Se requiere nuevo inicio de sesión.");
        logout();
        throw new Error('Session renewal failed. Please log in again.');
    }
}

// Realizar peticiones a la API con el token JWT
async function fetchWithAuth(url, options = {}) {
    token = getToken() || await initializeToken(); // Obtener token o inicializarlo

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`, // Agregar el token al header de la solicitud
    };

    const response = await fetch(url, options);

    // Si el token no es válido, renovamos y reintentamos la solicitud
    if (response.status === 403) {
        token = await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options);
    }

    return response;
}

// Verificar la firma del usuario al loguearse
export async function authenticateWithServer(pubkey, signature, message) {
    try {
        console.log("🔵 Enviando autenticación con:");
        console.log("   👉 PubKey:", pubkey);
        console.log("   👉 Signature:", signature);
        console.log("   👉 Message:", message);

        const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey, signature, message }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`❌ Fallo en autenticación: ${errorData.message}`);
        }

        const data = await response.json();
        console.log("✅ Token recibido:", data.token);
        setToken(data.token);
        return data.token;
    } catch (error) {
        console.error("❌ Error en authenticateWithServer():", error);
        throw error;
    }
}


// Función para cerrar la sesión del usuario
export function logout() {
    removeToken(); // Eliminar el token de localStorage
    console.info("🔵 Usuario deslogueado correctamente.");
}

// Registro de un nuevo usuario con la firma y mensaje
export async function register(pubkey, signature, message) {
    try {
        if (!pubkey || !signature || !message) {
            throw new Error("🔴 Faltan parámetros en el registro.");
        }

        // Verificar la firma utilizando la librería tweetnacl
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

export { fetchWithAuth, refreshToken, initializeToken };
