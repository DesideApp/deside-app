import { getCookie } from './tokenService.js'; // Import getCookie function

let token = localStorage.getItem('jwtToken'); // Inicializa con el token almacenado en localStorage

async function getCsrfToken() {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
        throw new Error('Error al obtener el token CSRF');
    }

    const data = await response.json();
    document.cookie = `XSRF-TOKEN=${data.csrfToken}; SameSite=Strict; Secure`;
    return data.csrfToken;
}

async function initializeToken() {
    if (!token) {
        console.log('Initializing token...'); // Log de inicialización del token
        await getCsrfToken(); // Obtener el token CSRF antes de cualquier otra solicitud

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Enviar el token CSRF
            },
            body: JSON.stringify({ username: 'deside.w3app@gmail.com' }), // Cambia por un username válido
            credentials: 'include', // Incluye las cookies en la solicitud
        });

        if (!response.ok) {
            console.error('Error al obtener token inicial:', response.statusText);
            throw new Error('Error al obtener token inicial');
        }

        const data = await response.json();
        token = data.token; // Guarda el token
        localStorage.setItem('jwtToken', token); // Almacena el token en localStorage
        console.log('Token inicial obtenido:', token);
    }
}

async function refreshToken() {
    console.log('Refreshing token...'); // Log de refresco del token
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
            'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Enviar el token CSRF
        },
        credentials: 'include', // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
        console.error('Error al refrescar el token:', response.statusText);
        throw new Error('Error al refrescar el token');
    }

    const data = await response.json();
    token = data.token; // Actualiza el token
    localStorage.setItem('jwtToken', token); // Actualiza el token en localStorage
    console.log('Token refrescado:', token);
    return token;
}

async function fetchWithAuth(url, options = {}) {
    if (!token) {
        await initializeToken(); // Obtén el token inicial si no existe
    }

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') // Enviar el token CSRF
    };
    options.credentials = 'include'; // Incluye las cookies en cada solicitud

    const response = await fetch(url, options);

    if (response.status === 403) {
        console.warn('Token expirado, intentando refrescar...');
        await refreshToken();
        options.headers.Authorization = `Bearer ${token}`;
        return fetch(url, options); // Reintenta la solicitud
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken, getCsrfToken };
