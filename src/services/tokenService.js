import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key';

export function setToken(token) {
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);
}

export function getToken() {
    const encryptedToken = localStorage.getItem('jwtToken');
    if (!encryptedToken) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

export function removeToken() {
    localStorage.removeItem('jwtToken');
}

let accessToken = null;

export async function getAccessToken() {
    if (accessToken && !isTokenExpired(accessToken)) {
        return accessToken;
    }

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Refresh token expired or invalid');
        }

        const data = await response.json();
        accessToken = data.accessToken;
        return accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        removeToken();
        window.location.href = '/login';
    }
}

export function isTokenExpired(token) {
    try {
        if (!token) return true;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error parsing token:', error);
        return true;
    }
}

export async function refreshToken() {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        setToken(data.token);
        accessToken = data.accessToken;
        return data.token;
    } catch (error) {
        console.error('Error refreshing token:', error);
        removeToken();
        throw new Error('Unable to refresh session. Please log in again.');
    }
}

export function getTokens() {
    const jwtToken = getToken();
    if (!jwtToken) {
        throw new Error('JWT Token is missing');
    }
    return { jwtToken };
}