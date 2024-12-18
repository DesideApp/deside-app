import { apiRequest } from './apiService.js';
import { setToken, removeToken, getToken, getCsrfToken, setCookie } from './tokenService.js';
import API_BASE_URL from '../apiConfig';

let token = null; // Inicializa como null

async function initializeToken() {
    if (!token) {
        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: 'deside.w3app@gmail.com' }), // Cambia por un username válido
        });

        if (!response.ok) {
            throw new Error('Error al obtener token inicial');
        }

        const data = await response.json();
        token = data.token; // Guarda el token
        localStorage.setItem('jwtToken', token); // Almacena el token en localStorage
        console.log('Token inicial obtenido:', token);
    }
}

async function refreshToken() {
    try {
        const response = await apiRequest('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Enviar cookies HTTP-only al backend
            headers: {
                'Content-Type': 'application/json',
            },
        });

        setToken(response.token); // Actualiza el token JWT en localStorage
        console.log('Token renovado:', response.token);
        return response.token;
    } catch (error) {
        console.error('Error al refrescar el token:', error);
        logout(); // Cierra sesión si no se puede renovar el token
        throw new Error('Session renewal failed. Please log in again.');
    }
}

async function fetchWithAuth(url, options = {}) {
    if (!token) {
        await initializeToken(); // Obtén el token inicial si no existe
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    const response = await fetch(url, options);

    if (response.status === 403) {
        console.warn('Token expirado, intentando refrescar...');
        await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options); // Reintenta la solicitud
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken };

// Validar credenciales de usuario
function validateCredentials(username, password) {
    if (!username || !password) {
        throw new Error('Username and password are required.');
    }
}

// Validar datos de registro
function validateRegistrationData(username, password, email) {
    if (!username || !password || !email) {
        throw new Error('Username, password, and email are required.');
    }
}

// Inicio de sesión del usuario
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

        const { csrfToken, token } = response;

        // Guardar tokens
        setToken(token);
        document.cookie = `XSRF-TOKEN=${csrfToken}; path=/`;

        console.log('Login exitoso, tokens guardados.');
        console.log('JWT Token in localStorage:', localStorage.getItem('jwtToken'));
        console.log('CSRF Token in cookie:', document.cookie);
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Login failed. Please check your credentials and try again.');
    }
}

// Cierre de sesión del usuario
export function logout() {
    removeToken(); // Elimina el token JWT del almacenamiento local
    document.cookie = 'XSRF-TOKEN=; Max-Age=0'; // Elimina el token CSRF
    window.location.href = '/login'; // Redirige al inicio de sesión
}

// Registro de un nuevo usuario
export async function register(username, password, email) {
    try {
        validateRegistrationData(username, password, email);

        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, email }),
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);
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

        // Guardar JWT en localStorage
        if (response.token) {
            setToken(response.token);
            console.log('JWT Token saved:', response.token);
        }

        // Guardar CSRF en cookie
        if (response.csrfToken) {
            setCookie('XSRF-TOKEN', response.csrfToken);
            console.log('CSRF Token saved:', response.csrfToken);
        }

        console.log('Token fetched successfully');
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};
