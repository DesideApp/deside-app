import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"; // ✅ Ahora configurable desde `.env`

/**
 * 🔹 **Obtener balance en SOL**
 */
export async function getBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.error("❌ Dirección de wallet inválida.");
            return null;
        }

        const connection = new Connection(RPC_URL, "confirmed");
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
 * 🔹 **Obtener datos de Solana sin pasar por nuestro backend**
 */
export async function fetchSolanaData(endpoint) {
    try {
        const response = await fetch(`https://api.mainnet-beta.solana.com/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log(`🔗 Datos de Solana recibidos (${endpoint}):`, data);
        return data;
    } catch (error) {
        console.error(`❌ Error obteniendo datos de ${endpoint}:`, error);
        return null;
    }
}

/**
 * 🔹 **Crear conexión a la red de Solana**
 */
export function createSolanaConnection(cluster = RPC_URL) {
    try {
        if (!cluster) throw new Error("Cluster de Solana no definido.");
        const connection = new Connection(cluster, "confirmed");
        console.log(`✅ Conectado a Solana (${cluster})`);
        return connection;
    } catch (error) {
        console.error("❌ Error creando conexión a Solana:", error);
        return null;
    }
}
