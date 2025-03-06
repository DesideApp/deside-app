import { apiRequest } from "../services/apiService.js";
import { API_BASE_URL } from "../config/apiConfig.js";

const SOLANA_API_BASE = `${API_BASE_URL}/api/solana`; // 🔥 Corrección: Se mantiene el `/api/solana` según el documento

/**
 * 🔹 **Obtener estado de Solana desde el backend**
 */
export async function getSolanaStatus() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-status`, { method: "GET" });
        return response?.status || "offline";
    } catch (error) {
        console.warn("⚠️ Error obteniendo estado de Solana:", error.message || error);
        return "offline";
    }
}

/**
 * 🔹 **Obtener TPS de Solana desde el backend**
 */
export async function getSolanaTPS() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-tps`, { method: "GET" });
        return typeof response?.tps === "number" ? response.tps : 0;
    } catch (error) {
        console.warn("⚠️ Error obteniendo TPS de Solana:", error.message || error);
        return 0;
    }
}

/**
 * 🔹 **Obtener precio de SOL desde el backend**
 */
export async function getSolanaPrice() {
    try {
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-price`, { method: "GET" });
        return typeof response?.price === "number" ? response.price : 0;
    } catch (error) {
        console.warn("⚠️ Error obteniendo precio de SOL:", error.message || error);
        return 0;
    }
}
