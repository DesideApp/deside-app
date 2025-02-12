import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'fallback-secret-key';  

// Guardar token en localStorage de forma encriptada
export function setToken(token) {
    if (!token || typeof token !== "string") return;
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);
}

// Obtener y desencriptar el token desde localStorage
export function getToken() {
    const encryptedToken = localStorage.getItem('jwtToken');
    if (!encryptedToken) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedToken || null;
    } catch (error) {
        console.error("🔴 Error al desencriptar token:", error);
        return null;
    }
}

// Eliminar token de localStorage
export function removeToken() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('refreshToken');  
}

// Verificar si el token ha expirado
export function isTokenExpired() {
    const token = getToken();
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
        console.error("🔴 Error parsing JWT token:", error);
        return true;
    }
}

// 🔄 **Renovar token usando el refreshToken**
export async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            removeToken();
            throw new Error('No refresh token found');
        }

        const response = await fetch('https://backend-deside.onrender.com/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            removeToken();
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        setToken(data.accessToken);
        return data.accessToken;
    } catch (error) {
        console.error("🔴 Error al renovar token:", error);
        removeToken(); 
        throw error;
    }
}

// Obtener todos los tokens disponibles
export function getTokens() {
    return { jwtToken: getToken(), refreshToken: localStorage.getItem('refreshToken') };
}
