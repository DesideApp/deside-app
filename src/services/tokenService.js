import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key';

let accessToken = null;

export function setToken(token) {
    accessToken = token;
    const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
    localStorage.setItem('jwtToken', encryptedToken);
}

export function getToken() {
    if (!accessToken) {
        const encryptedToken = localStorage.getItem('jwtToken');
        if (!encryptedToken) return null;
        const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
        accessToken = bytes.toString(CryptoJS.enc.Utf8);
    }
    return accessToken;
}

export function removeToken() {
    accessToken = null;
    localStorage.removeItem('jwtToken');
}

export const getAccessToken = () => {
    return localStorage.getItem('jwtToken');
};

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

export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await fetch('https://backend-deside.onrender.com/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token');

        const data = await response.json();
        localStorage.setItem('jwtToken', data.accessToken);
        return data.accessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

export function getTokens() {
    const jwtToken = getToken();
    if (!jwtToken) {
        throw new Error('JWT Token is missing');
    }
    return { jwtToken };
}