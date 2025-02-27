import { apiRequest } from '../services/apiService.js';

// 🔹 **Función genérica para obtener datos de Solana**
async function fetchSolanaData(endpoint, errorMessage) {
    try {
        return await apiRequest(`/api/${endpoint}`, { method: 'GET' });
    } catch (error) {
        console.error(`❌ ${errorMessage}:`, error);
        return { error: true, message: errorMessage };
    }
}

// 🔹 **Obtener precio de Solana**
export const fetchSolanaPrice = () => fetchSolanaData('solana-price', 'Error obteniendo el precio de Solana');

// 🔹 **Obtener TPS de Solana**
export const fetchSolanaTPS = () => fetchSolanaData('solana-tps', 'Error obteniendo TPS de Solana');

// 🔹 **Obtener estado de la red de Solana**
export const fetchSolanaStatus = () => fetchSolanaData('solana-status', 'Error obteniendo el estado de la red de Solana');
