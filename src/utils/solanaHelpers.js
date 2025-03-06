import { apiRequest } from "../services/apiService.js";
import API_BASE_URL from "../config/apiConfig.js";

const SOLANA_API_BASE = `${API_BASE_URL}/api`;

/**
 * 🔹 **Obtener estado de Solana desde el backend**
 */
export async function getSolanaStatus() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-status`, { method: "GET" });
        return response?.status || "offline";
    } catch {
        return "offline";
    }
}

/**
 * 🔹 **Obtener TPS de Solana desde el backend**
 */
export async function getSolanaTPS() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-tps`, { method: "GET" });
        return response?.tps ?? 0;
    } catch {
        return 0;
    }
}

/**
 * 🔹 **Obtener precio de SOL desde el backend**
 */
export async function getSolanaPrice() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-price`, { method: "GET" });
        return response?.price ?? 0;
    } catch {
        return 0;
    }
}
