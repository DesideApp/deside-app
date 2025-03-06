import { apiRequest } from "../services/apiService.js";
import API_BASE_URL from "../config/apiConfig.js";

const SOLANA_API_BASE = `${API_BASE_URL}/api`.replace(/\/$/, ""); // ✅ CORREGIDO

console.log(`✅ SOLANA API Base: ${SOLANA_API_BASE}`);

/**
 * 🔹 **Obtener estado de Solana desde el backend**
 */
export async function getSolanaStatus() {
    try {
        console.log(`🔄 Fetching Solana Status from: ${SOLANA_API_BASE}/solana-status`);
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-status`, { method: "GET" });

        if (!response || typeof response.status !== "string") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaStatus()`:", response);
            return "offline";
        }

        return response.status;
    } catch (error) {
        console.error("❌ Error obteniendo estado de Solana:", error);
        return "offline";
    }
}

/**
 * 🔹 **Obtener TPS de Solana desde el backend**
 */
export async function getSolanaTPS() {
    try {
        console.log(`🔄 Fetching Solana TPS from: ${SOLANA_API_BASE}/solana-tps`);
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-tps`, { method: "GET" });

        if (!response || typeof response.tps !== "number") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaTPS()`:", response);
            return 0;
        }

        return response.tps;
    } catch (error) {
        console.error("❌ Error obteniendo TPS de Solana:", error);
        return 0;
    }
}

/**
 * 🔹 **Obtener precio de SOL desde el backend**
 */
export async function getSolanaPrice() {
    try {
        console.log(`🔄 Fetching Solana Price from: ${SOLANA_API_BASE}/solana-price`);
        const response = await apiRequest(`${SOLANA_API_BASE}/solana-price`, { method: "GET" });

        if (!response || typeof response.price !== "number") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaPrice()`:", response);
            return 0;
        }

        return response.price;
    } catch (error) {
        console.error("❌ Error obteniendo precio de Solana:", error);
        return 0;
    }
}
