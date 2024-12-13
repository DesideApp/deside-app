let token = null; // Token inicial

// Endpoint para obtener un nuevo token
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
    console.log('Nuevo token obtenido:', token);
    return token;
}

// Función para realizar solicitudes con el token
async function fetchWithAuth(url, options = {}) {
    if (!token) {
        // Inicializar token si aún no se ha obtenido
        const storedToken = localStorage.getItem('authToken');
        token = storedToken || 'your-initial-token'; // Cambiar a tu token inicial o una lógica adecuada
    }

    // Configurar headers con el token
    const headers = options.headers || {};
    options.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
    };

    // Realizar la solicitud
    const response = await fetch(url, options);

    // Si el token está expirado, intenta refrescarlo y reintentar
    if (response.status === 403) {
        console.warn('Token expirado, intentando refrescar...');
        await refreshToken();
        options.headers.Authorization = `Bearer ${token}`; // Actualiza el token en el header
        return fetch(url, options); // Reintenta la solicitud
    }

    // Si no hay error, devuelve la respuesta
    return response;
}

export { fetchWithAuth, refreshToken };
