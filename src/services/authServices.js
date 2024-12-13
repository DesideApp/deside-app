let token = null; // Token inicial

// Función para refrescar el token
async function refreshToken() {
    if (!token) {
        throw new Error('No se puede refrescar el token porque no está definido.');
    }

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
    localStorage.setItem('authToken', token); // Guarda el nuevo token en localStorage
    console.log('Nuevo token obtenido:', token);
    return token;
}

// Función para realizar solicitudes con autenticación
async function fetchWithAuth(url, options = {}) {
    if (!token) {
        // Inicializar token desde localStorage o usar un valor inicial
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            token = storedToken;
        } else {
            throw new Error('No token available for authenticated requests.');
        }
    }

    // Configurar headers con el token
    const headers = options.headers || {};
    options.headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
    };

    // Realizar la solicitud
    let response = await fetch(url, options);

    // Si el token está expirado, intenta refrescarlo y reintentar
    if (response.status === 403) {
        console.warn('Token expirado, intentando refrescar...');
        await refreshToken(); // Actualiza el token
        options.headers.Authorization = `Bearer ${token}`; // Actualiza el token en los headers
        response = await fetch(url, options); // Reintenta la solicitud
    }

    return response;
}

// Inicializar el token en la aplicación (opcional, para asegurar un flujo claro)
function initializeToken(initialToken) {
    token = initialToken;
    localStorage.setItem('authToken', initialToken); // Guarda el token inicial en localStorage
    console.log('Token inicial configurado:', initialToken);
}

export { fetchWithAuth, refreshToken, initializeToken };
