let token = null; // Inicializa como null

async function initializeToken() {
    if (!token) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/token`, {
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
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
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
