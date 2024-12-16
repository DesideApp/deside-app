const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

if (!API_BASE_URL) {
    throw new Error('Backend URL not defined.');
}

console.log('API_BASE_URL:', API_BASE_URL); // Para depurar
export default API_BASE_URL;
