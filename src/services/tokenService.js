import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key';  // Definir una clave secreta para la encriptación.

let accessToken = null;

// Función para guardar el token en el localStorage de forma cifrada.
export function setToken(token) {
    accessToken = token;
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);  // Guardar el token en el localStorage.
}

// Función para obtener el token del localStorage y descifrarlo.
export function getToken() {
    if (!accessToken) {
        const encryptedToken = localStorage.getItem('jwtToken');
        if (!encryptedToken) return null;  // Si no existe, devolver null.
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        accessToken = bytes.toString(CryptoJS.enc.Utf8);  // Desencriptar el token.
    }
    return accessToken;  // Devolver el token.
}

// Función para eliminar el token de la memoria y localStorage.
export function removeToken() {
    accessToken = null;
    localStorage.removeItem('jwtToken');  // Eliminar el token del localStorage.
}

// Función para obtener el token de acceso desde el localStorage sin procesar.
export const getAccessToken = () => {
    return localStorage.getItem('jwtToken');  // Obtener directamente el token desde el localStorage.
};

// Función para verificar si el token ha expirado basado en su payload.
export function isTokenExpired(token) {
    try {
        if (!token) return true;
        const payload = JSON.parse(atob(token.split('.')[1]));  // Decodificar el payload del JWT.
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;  // Verificar si el token ha expirado.
    } catch (error) {
        console.error('Error parsing token:', error);
        return true;  // Si hay un error al decodificar, asumir que el token ha expirado.
    }
}

// Función para solicitar la renovación del token al backend.
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');  // Obtener el refresh token.
        if (!refreshToken) throw new Error('No refresh token found');  // Si no hay refresh token, lanzar un error.

        const response = await fetch('https://backend-deside.onrender.com/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),  // Enviar el refresh token para obtener un nuevo JWT.
        });

        if (!response.ok) throw new Error('Failed to refresh token');  // Si la respuesta no es OK, lanzar error.

        const data = await response.json();
        localStorage.setItem('jwtToken', data.accessToken);  // Guardar el nuevo token.
        return data.accessToken;  // Devolver el nuevo access token.
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;  // Lanzar el error si no se pudo renovar el token.
    }
};

// Función para obtener los tokens desde el localStorage.
export function getTokens() {
    const jwtToken = getToken();
    if (!jwtToken) {
        throw new Error('JWT Token is missing');  // Lanzar error si no se encuentra el JWT.
    }
    return { jwtToken };  // Devolver el JWT.
}
