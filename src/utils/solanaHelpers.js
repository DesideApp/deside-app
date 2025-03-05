import { apiRequest } from "../services/apiService.js"; // ✅ Centralizamos las llamadas API
import API_BASE_URL from "../config/apiConfig.js"; // ✅ Aseguramos la URL del backend

/**
 * 🔹 **Obtener estado de Solana desde el backend**
 */
export async function getSolanaStatus() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/solana/solana-status`, { method: "GET" });

        if (!response || typeof response.status !== "string") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaStatus()`:", response);
            return "offline";
        }

        return response.status;
    } catch (error) {
        console.error("❌ Error obteniendo estado de Solana desde el backend:", error);
        return "offline";
    }
}

/**
 * 🔹 **Obtener TPS de Solana desde el backend**
 */
export async function getSolanaTPS() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/solana/solana-tps`, { method: "GET" });

        if (!response || typeof response.tps !== "number") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaTPS()`:", response);
            return 0;
        }

        return response.tps;
    } catch (error) {
        console.error("❌ Error obteniendo TPS de Solana desde el backend:", error);
        return 0;
    }
}

/**
 * 🔹 **Obtener precio de SOL desde el backend**
 */
export async function getSolanaPrice() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/solana/solana-price`, { method: "GET" });

        if (!response || typeof response.price !== "number") {
            console.warn("⚠️ Respuesta inesperada en `getSolanaPrice()`:", response);
            return 0;
        }

        return response.price;
    } catch (error) {
        console.error("❌ Error obteniendo precio de Solana desde el backend:", error);
        return 0;
    }
}
