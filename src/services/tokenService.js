import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'fallback-secret-key';  // 🔹 Usa .env para más seguridad 🔒

// Guardar token en localStorage de forma encriptada
export function setToken(token) {
    if (!token) return;
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);
}

// Obtener y desencriptar el token desde localStorage
export function getToken() {
    const encryptedToken = localStorage.getItem('jwtToken');
    if (!encryptedToken) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch (error) {
        console.error("🔴 Error al desencriptar token:", error);
        return null;
    }
}

// Eliminar token de localStorage
export function removeToken() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');  // 🔹 También eliminamos el refreshToken
}

// Verificar si el token ha expirado
export function isTokenExpired() {
    const token = getToken();
    if (!token) return true; // 🔹 Si no hay token, asumimos que ha expirado

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Math.floor(Date.now() / 1000); // Comparar con el tiempo actual
    } catch (error) {
        console.error("🔴 Error parsing JWT token:", error);
        return true;
    }
}

// Obtener el token sin procesarlo (puede ser útil en algunos casos)
export function getAccessToken() {
    return localStorage.getItem('jwtToken');
}

// 🔄 **Renovar token usando el refreshToken**
export async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await fetch('https://backend-deside.onrender.com/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        setToken(data.accessToken);
        return data.accessToken;
    } catch (error) {
        console.error("🔴 Error al renovar token:", error);
        removeToken(); // 🔹 Si falla, limpiamos tokens para evitar problemas
        throw error;
    }
}

// Obtener todos los tokens disponibles
export function getTokens() {
    return { jwtToken: getToken(), refreshToken: localStorage.getItem('refreshToken') };
}
