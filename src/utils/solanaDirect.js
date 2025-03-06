import { getProvider } from "../services/walletProviders.js";
import { Connection, PublicKey } from "@solana/web3.js";

const FALLBACK_RPC_URL = "https://api.mainnet-beta.solana.com"; // 🔄 Solo se usa si el proveedor falla
const connection = new Connection(FALLBACK_RPC_URL, "confirmed");

/**
 * 💰 **Obtener balance de una wallet conectada**
 * @param {string} walletAddress - Dirección pública de la wallet.
 * @param {string} selectedWallet - Proveedor de la wallet (phantom, backpack, magiceden).
 * @returns {Promise<number|null>} - Balance en SOL o `null` en caso de error.
 */
export async function getWalletBalance(walletAddress, selectedWallet) {
    try {
        if (!walletAddress || !selectedWallet) throw new Error("❌ Wallet no proporcionada.");

        // ✅ **Intentar obtener el balance desde el proveedor de la wallet**
        const provider = getProvider(selectedWallet);
        if (provider?.isConnected && provider?.publicKey?.toBase58() === walletAddress) {
            console.log(`🔍 Consultando balance a través del proveedor: ${selectedWallet}`);
            const balance = await provider.connection.getBalance(provider.publicKey);
            return balance / 1e9; // ✅ Convertir de lamports a SOL
        }

        console.warn(`⚠️ No se pudo obtener balance desde ${selectedWallet}, usando RPC...`);

        // ✅ **Fallback: Consultar al nodo RPC si el proveedor falla**
        const publicKey = new PublicKey(walletAddress);
        const balance = await connection.getBalance(publicKey);
        return balance / 1e9;
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
        return null;
    }
}
