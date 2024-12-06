const LOCAL_API_URL = 'https://backend-deside.onrender.com/api'; // URL del backend local
const PRODUCTION_API_URL = 'https://backend-deside.onrender.com/api'; // URL del backend en producción

const API_BASE_URL =
    process.env.NODE_ENV === 'production' ? PRODUCTION_API_URL : LOCAL_API_URL;

export default API_BASE_URL;
