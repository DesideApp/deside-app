const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backend-deside.onrender.com';

console.log(`🔗 API Base URL: ${API_BASE_URL} (modo: ${import.meta.env.MODE})`);

export default API_BASE_URL;
