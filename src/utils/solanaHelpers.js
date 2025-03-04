import { Connection, PublicKey } from "@solana/web3.js";

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
 * 🔹 **Crear conexión reutilizable a Solana**
 */
export function getSolanaConnection() {
    return connection; // ✅ Reutiliza la conexión única
}

/**
 * 🔹 **Obtener estado actual de Solana**
 */
export async function getSolanaStatus() {
    try {
        const status = await connection.getHealth();
        return status === "ok" ? "connected" : "degraded";
    } catch (error) {
        console.error("❌ Error obteniendo estado de la red Solana:", error);
        return "offline";
    }
}

/**
 * 🔹 **Obtener TPS de Solana**
 */
export async function getSolanaTPS() {
    try {
        const tps = await connection.getRecentPerformanceSamples(1);
        return tps?.[0]?.numTransactions / tps?.[0]?.samplePeriodSecs || null;
    } catch (error) {
        console.error("❌ Error obteniendo TPS de Solana:", error);
        return null;
    }
}
