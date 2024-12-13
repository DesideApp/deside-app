async function initializeToken() {
    console.log('Initializing token...'); // Log de inicialización del token
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'deside.w3app@gmail.com' }), // Cambia por un username válido
        credentials: 'include', // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
        throw new Error('Error al obtener token inicial');
    }

    const data = await response.json();
    console.log('Token inicial obtenido:', data.token);
}

async function refreshToken() {
    console.log('Refreshing token...'); // Log de refresco del token
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Incluye las cookies en la solicitud
    });

    if (!response.ok) {
        throw new Error('Error al refrescar el token');
    }

    const data = await response.json();
    console.log('Token refrescado:', data.token);
    return data.token;
}

async function fetchWithAuth(url, options = {}) {
    options.credentials = 'include'; // Incluye las cookies en cada solicitud

    const response = await fetch(url, options);

    if (response.status === 403) {
        console.warn('Token expirado, intentando refrescar...');
        await refreshToken();
        return fetch(url, options); // Reintenta la solicitud
    }

    return response;
}

export { fetchWithAuth, refreshToken, initializeToken };
