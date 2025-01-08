import nacl from "tweetnacl";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccessToken } from '../services/tokenService'; // Para autenticación
import { apiRequest } from '../services/apiService'; // Solicitudes API

const RPC_URL = 'https://rpc.ankr.com/solana_devnet/84d7f098a02eb4c502839fa2cff526bb9d0ee07aa75c19ecf28f8925a824ba59';

let activeWalletProvider = null; // Proveedor activo
let activeWalletType = null; // Tipo de wallet activa

/**
 * Detecta y configura el proveedor de wallet según el tipo seleccionado.
 */
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

/**
 * Conecta la wallet seleccionada y guarda su proveedor.
 */
export async function connectWallet(wallet) {
    try {
        const provider = getProvider(wallet);
        const response = await provider.connect({ onlyIfTrusted: false });

        if (!response.publicKey) {
            throw new Error(`Connection to ${wallet} cancelled by the user.`);
        }

        // Configura la wallet activa
        activeWalletProvider = provider;
        activeWalletType = wallet;

        console.log(`${wallet} Wallet connected: ${response.publicKey.toString()}`);
        return response.publicKey.toString();
    } catch (error) {
        console.error(`Error al conectar ${wallet} Wallet:`, error);
        throw error;
    }
}

/**
 * Desconecta la wallet activa.
 */
export async function disconnectWallet() {
    try {
        if (activeWalletProvider?.disconnect) {
            await activeWalletProvider.disconnect();
            console.log(`${activeWalletType} Wallet disconnected`);
        }

        // Limpia el estado de la wallet activa
        activeWalletProvider = null;
        activeWalletType = null;
    } catch (error) {
        console.error(`Error desconectando la wallet:`, error);
        throw error;
    }
}

/**
 * Firma un mensaje utilizando la wallet activa.
 */
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

/**
 * Verifica la firma de un mensaje.
 */
export function verifySignature(message, signature, publicKey) {
    try {
        const encodedMessage = new TextEncoder().encode(message);
        const pubKey = new PublicKey(publicKey);
        const signatureUint8Array = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

        const isValid = pubKey.verify(encodedMessage, signatureUint8Array);
        console.log(`Signature valid: ${isValid}`);
        return isValid;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

/**
 * Obtiene el balance de una wallet en SOL.
 */
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

/**
 * Realiza una solicitud autenticada a la API.
 */
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

/**
 * Crea una conexión a la red Solana.
 */
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
