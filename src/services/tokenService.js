// Guardar token en localStorage
export function setToken(token) {
    localStorage.setItem('jwtToken', token);
}

// Obtener token de localStorage
export function getToken() {
    return localStorage.getItem('jwtToken');
}

// Eliminar token de localStorage
export function removeToken() {
    localStorage.removeItem('jwtToken');
}

let accessToken = null; // Almacenar temporalmente el access token en memoria

async function getAccessToken() {
    // Si el token ya existe y no ha expirado, devuélvelo
    if (accessToken && !isTokenExpired(accessToken)) {
        return accessToken;
    }

    // Si el token ha expirado, renueva el access token usando el refresh token
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
            console.error('Failed to refresh token:', response.statusText);
            throw new Error('Refresh token expired or invalid');
        }

        const data = await response.json();
        accessToken = data.accessToken; // Actualiza el access token en memoria
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        window.location.href = '/login'; // Redirige al inicio de sesión
    }
}

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return payload.exp < currentTime; // Devuelve true si el token ha expirado
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export { getAccessToken, isTokenExpired, getCookie };