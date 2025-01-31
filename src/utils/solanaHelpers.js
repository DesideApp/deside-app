import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccessToken } from '../services/tokenService'; // Para autenticación
import { apiRequest } from '../services/apiService'; // Solicitudes API

const RPC_URL = 'https://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59';

export async function fetchSolanaPrice() {
    try {
        const price = await apiRequest("/api/solana-price", { method: "GET" });
        console.log("Solana price fetched:", price);
        return price;
    } catch (error) {
        console.error("Error fetching Solana price:", error);
        throw error;
    }
}

export async function fetchSolanaTPS() {
    try {
        const tps = await apiRequest("/api/solana-tps", { method: "GET" });
        console.log("Solana TPS fetched:", tps);
        return tps;
    } catch (error) {
        console.error("Error fetching Solana TPS:", error);
        throw error;
    }
}

export async function fetchSolanaStatus() {
    try {
        const status = await apiRequest("/api/solana-status", { method: "GET" });
        console.log("Solana network status fetched:", status);
        return status;
    } catch (error) {
        console.error("Error fetching Solana network status:", error);
        throw error;
    }
}

export async function getBalance(walletAddress) {
    try {
        const connection = new Connection(RPC_URL, 'confirmed');
        const publicKey = new PublicKey(walletAddress);

        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSol = balanceLamports / 1e9;

        console.log(`Balance for ${walletAddress}: ${balanceSol} SOL`);
        return balanceSol;
    } catch (error) {
        console.error(`Error fetching balance for ${walletAddress}:`, error);
        throw error;
    }
}

export async function fetchSolanaData(endpoint) {
    try {
        const accessToken = await getAccessToken();

        const response = await apiRequest(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud a ${endpoint}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        throw error;
    }
}

export function createSolanaConnection(cluster = RPC_URL) {
    try {
        const connection = new Connection(cluster, 'confirmed');
        console.log(`Connected to Solana cluster: ${cluster}`);
        return connection;
    } catch (error) {
        console.error('Error creating Solana connection:', error);
        throw error;
    }
}
