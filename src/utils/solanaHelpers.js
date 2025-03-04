import { Connection, PublicKey } from "@solana/web3.js";
import { apiRequest } from "../services/apiService.js"; // ✅ Importamos apiRequest para usar el backend
import API_BASE_URL from "../config/apiConfig.js"; // ✅ Asegurar que se usa la URL correcta del backend

const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_URL, "confirmed"); // ✅ Instancia única y reutilizable

/**
 * 🔹 **Obtener balance en SOL**
 */
export async function getBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Dirección de wallet inválida.");
            return null;
        }

        const publicKey = new PublicKey(walletAddress);
        const balanceLamports = await connection.getBalance(publicKey);
        return balanceLamports / 1e9;
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
        return null;
    }
}

/**
 * 🔹 **Obtener estado de Solana desde el backend**
 */
export async function getSolanaStatus() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/solana/solana-status`, { method: "GET" });
        return response?.status || "offline"; // ✅ Devuelve "offline" si hay un error
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
        return response?.tps || null;
    } catch (error) {
        console.error("❌ Error obteniendo TPS de Solana desde el backend:", error);
        return null;
    }
}

/**
 * 🔹 **Obtener precio de SOL desde el backend**
 */
export async function getSolanaPrice() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/api/solana/solana-price`, { method: "GET" });
        return response?.price || null;
    } catch (error) {
        console.error("❌ Error obteniendo precio de Solana desde el backend:", error);
        return null;
    }
}
