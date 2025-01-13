import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccessToken } from '../services/tokenService'; // Para autenticación
import { apiRequest } from '../services/apiService'; // Solicitudes API

const RPC_URL = 'https://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59';

let activeWalletProvider = null; // Proveedor activo
let activeWalletType = null; // Tipo de wallet activa

function getProvider(wallet) {
    if (wallet === "phantom" && window.solana?.isPhantom) {
        return window.solana;
    } else if (wallet === "backpack" && window.xnft?.solana) {
        return window.xnft.solana;
    } else if (wallet === "magiceden" && window.magicEden?.solana) {
        return window.magicEden.solana;
    } else {
        throw new Error(`${wallet} Wallet not detected`);
    }
}

export async function connectWallet(wallet) {
    try {
        const provider = getProvider(wallet);
        const response = await provider.connect({ onlyIfTrusted: false });

        if (!response.publicKey) {
            throw new Error(`Connection to ${wallet} cancelled by the user.`);
        }

        activeWalletProvider = provider;
        activeWalletType = wallet;

        console.log(`${wallet} Wallet connected: ${response.publicKey.toString()}`);
        return response.publicKey.toString();
    } catch (error) {
        console.error(`Error al conectar ${wallet} Wallet:`, error);
        throw error;
    }
}

export async function disconnectWallet() {
    try {
        if (activeWalletProvider?.disconnect) {
            await activeWalletProvider.disconnect();
            console.log(`${activeWalletType} Wallet disconnected`);
        }

        activeWalletProvider = null;
        activeWalletType = null;
    } catch (error) {
        console.error(`Error desconectando la wallet:`, error);
        throw error;
    }
}

export async function signMessage(message) {
    try {
        if (!activeWalletProvider) {
            throw new Error("No wallet connected. Connect a wallet first.");
        }

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await activeWalletProvider.signMessage(encodedMessage);

        const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

        console.log("Message signed:", { message, signatureBase64 });
        return {
            signature: signatureBase64,
            message,
            pubkey: activeWalletProvider.publicKey.toBase58(),
        };
    } catch (error) {
        console.error(`Error signing message with ${activeWalletType} Wallet:`, error);
        throw error;
    }
}

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
        console.error(`Error al obtener el balance de ${walletAddress}:`, error);
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
        console.log(`Conexión establecida con el cluster: ${cluster}`);
        return connection;
    } catch (error) {
        console.error('Error creando conexión a Solana:', error);
        throw error;
    }
}

// Función para sobrescribir window.ethereum cuando sea necesario
export function overwriteEthereumProvider(wallet) {
    if (wallet === "phantom" && window.solana?.isPhantom) {
        window.ethereum = window.solana;
    } else if (wallet === "backpack" && window.xnft?.ethereum) {
        window.ethereum = window.xnft.ethereum;
    } else if (wallet === "magiceden" && window.magicEden?.ethereum) {
        window.ethereum = window.magicEden.ethereum;
    } else {
        console.error(`${wallet} Ethereum provider not detected`);
    }
}
