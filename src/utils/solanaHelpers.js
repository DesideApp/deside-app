import { Connection, PublicKey } from "@solana/web3.js";
import { apiRequest } from '../services/apiService'; // ✅ Centralizamos peticiones API

const RPC_URL = 'https://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59';

// 🔹 **Obtener balance en SOL**
export async function getBalance(walletAddress) {
    try {
        const connection = new Connection(RPC_URL, 'confirmed');
        const publicKey = new PublicKey(walletAddress);

        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSol = balanceLamports / 1e9;

        console.log(`💰 Balance de ${walletAddress}: ${balanceSol} SOL`);
        return balanceSol;
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
        return null; // 🔄 Evita bloquear la app si hay error
    }
}

// 🔹 **Hacer solicitudes a la API de Solana**
export async function fetchSolanaData(endpoint) {
    try {
        const data = await apiRequest(endpoint, { method: 'GET' });
        console.log(`🔗 Datos de Solana recibidos (${endpoint}):`, data);
        return data;
    } catch (error) {
        console.error(`❌ Error obteniendo datos de ${endpoint}:`, error);
        return null;
    }
}

// 🔹 **Crear conexión a la red de Solana**
export function createSolanaConnection(cluster = RPC_URL) {
    try {
        const connection = new Connection(cluster, 'confirmed');
        console.log(`✅ Conectado a Solana (${cluster})`);
        return connection;
    } catch (error) {
        console.error('❌ Error creando conexión a Solana:', error);
        return null;
    }
}
