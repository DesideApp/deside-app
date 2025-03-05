import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_URL, "confirmed"); // ✅ Instancia única y reutilizable

/**
 * 🔹 **Obtener balance en SOL directamente desde la blockchain**
 */
export async function getBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Dirección de wallet inválida.");
            return null;
        }

        const publicKey = new PublicKey(walletAddress);
        const balanceLamports = await connection.getBalance(publicKey);
        return balanceLamports / 1e9; // Convertir de lamports a SOL
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
        return null;
    }
}
