import CryptoJS from 'crypto-js'; // Importar CryptoJS para encriptación

const SECRET_KEY = 'your-secret-key'; // Clave secreta para encriptación

// Guardar token en localStorage
export function setToken(token) {
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);
}

// Obtener token de localStorage
export function getToken() {
    const encryptedToken = localStorage.getItem('jwtToken');
    if (!encryptedToken) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// Eliminar token de localStorage
export function removeToken() {
    localStorage.removeItem('jwtToken');
}

let accessToken = null; // Almacenar temporalmente el access token en memoria

export async function getAccessToken() {
    if (accessToken && !isTokenExpired(accessToken)) {
        return accessToken;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Enviar cookies httpOnly al backend
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'), // Enviar el token CSRF
            },
        });

        if (!response.ok) {
            throw new Error('Refresh token expired or invalid');
        }

        const data = await response.json();
        accessToken = data.accessToken; // Actualiza el access token en memoria
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        removeToken();
        window.location.href = '/login'; // Redirige al inicio de sesión
    }
}

export function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return payload.exp < currentTime;
}

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export function getCsrfToken() {
    return getCookie('XSRF-TOKEN');
}

// Función para obtener y validar tokens CSRF y JWT
export function getTokens() {
    const csrfToken = getCsrfToken();
    const jwtToken = getToken();

    console.log('JWT Token from localStorage:', localStorage.getItem('jwtToken'));
    console.log('CSRF Token from cookies:', getCookie('XSRF-TOKEN'));

    if (!csrfToken || !jwtToken) {
        console.error('CSRF or JWT Token is missing');
        throw new Error('CSRF or JWT Token is missing');
    }

    return { csrfToken, jwtToken };
}

// Renovación del token JWT usando refresh token
export async function refreshToken() {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include', // Enviar cookies HTTP-only al backend
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to refresh token');
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        setToken(data.token); // Actualiza el token JWT en localStorage
        accessToken = data.accessToken; // Actualiza el access token en memoria
        return data.token;
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        removeToken();
        window.location.href = '/login'; // Redirige al inicio de sesión
    }
}