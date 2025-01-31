import { apiRequest } from '../services/apiService.js';

export async function fetchSolanaPrice() {
    try {
        const data = await apiRequest('/api/solana-price', { method: 'GET' });
        return data;
    } catch (error) {
        console.error('Error fetching Solana price:', error);
        throw error;
    }
}

export async function fetchSolanaTPS() {
    try {
        const data = await apiRequest('/api/solana-tps', { method: 'GET' });
        return data;
    } catch (error) {
        console.error('Error fetching Solana TPS:', error);
        throw error;
    }
}

export async function fetchSolanaStatus() {
    try {
        const data = await apiRequest('/api/solana-status', { method: 'GET' });
        return data;
    } catch (error) {
        console.error('Error fetching Solana network status:', error);
        throw error;
    }
}
