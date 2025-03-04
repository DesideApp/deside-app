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
        const balanceSol = balanceLamports / 1e9;

        console.log(`💰 Balance de ${walletAddress}: ${balanceSol} SOL`);
        return balanceSol;
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
