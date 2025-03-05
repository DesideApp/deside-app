import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = "https://api.mainnet-beta.solana.com"; // ✅ RPC por defecto
const connection = new Connection(RPC_URL, "confirmed"); // ✅ Crear conexión única

/**
 * 💰 **Obtener balance de una wallet conectada**
 * @param {string} walletAddress - Dirección pública de la wallet.
 * @returns {Promise<number|null>} - Balance en SOL o `null` en caso de error.
 */
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) throw new Error("❌ No se encontró una dirección de wallet válida.");

        const publicKey = new PublicKey(walletAddress); // ✅ Convertir a `PublicKey`
        const balance = await connection.getBalance(publicKey); // ✅ Obtener balance desde la red
        
        return balance / 1e9; // ✅ Convertir de lamports a SOL
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
        return null;
    }
}
