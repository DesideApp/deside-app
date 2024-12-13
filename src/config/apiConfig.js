const LOCAL_API_URL = 'https://backend-deside.onrender.com/api'; // URL del backend local
const PRODUCTION_API_URL = 'https://backend-deside.onrender.com/api'; // URL del backend en producción

const API_BASE_URL =
    process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;

console.log('API_BASE_URL:', API_BASE_URL); // Log para verificar la URL base de la API
console.log('REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL); // Log para verificar la variable de entorno

export default API_BASE_URL;
