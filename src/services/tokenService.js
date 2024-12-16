import jwt from 'jsonwebtoken';

const secretKey = 'your-secretKey';

const tokenService = {
    generateToken: (payload, expiresIn = '1h') => {
        return jwt.sign(payload, secretKey, { expiresIn });
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(token, secretKey);
        } catch (error) {
            return null;
        }
    },

    decodeToken: (token) => {
        return jwt.decode(token);
    }
};

export default tokenService;

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
        window.location.href = '/login'; // Redirige al inicio de sesión
    }
}

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el JWT
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return payload.exp < currentTime; // Devuelve true si el token ha expirado
}

export { getAccessToken, isTokenExpired };