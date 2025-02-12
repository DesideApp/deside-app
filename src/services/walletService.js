import bs58 from 'bs58'; // ✅ Base58 para la firma
import { authenticateWithServer } from './authServices'; // Autenticación en backend
import { PublicKey } from '@solana/web3.js';

let activeWalletProvider = null;
let activeWalletType = null;

const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

// 📌 Obtiene el proveedor de la billetera
function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        throw new Error(`❌ ${wallet} Wallet no detectada.`);
    }
    return provider;
}

// 📌 Conectar la billetera y obtener JWT
export async function connectWallet(wallet) {
    try {
        console.log(`🔵 Intentando conectar con ${wallet}`);

        const provider = getProvider(wallet);
        const response = await provider.connect({ onlyIfTrusted: false });

        if (!response.publicKey) throw new Error("❌ Conexión cancelada por el usuario.");

        console.log(`✅ ${wallet} conectado: ${response.publicKey.toString()}`);

        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        console.log("🔵 Firma generada:", signedData);

        const token = await authenticateWithServer(response.publicKey.toString(), signedData.signature, message);
        console.log("✅ Token JWT recibido:", token);

        return response.publicKey.toString();
    } catch (error) {
        console.error("❌ Error en connectWallet():", error);
        throw error;
    }
}


// 📌 Desconectar la billetera
export async function disconnectWallet() {
    try {
        if (activeWalletProvider?.disconnect) {
            await activeWalletProvider.disconnect();
            console.log(`✅ ${activeWalletType} Wallet desconectada.`);
        }

        activeWalletProvider = null;
        activeWalletType = null;
    } catch (error) {
        console.error(`❌ Error al desconectar la wallet:`, error);
        throw error;
    }
}

// 📌 Obtener la billetera conectada
export function getConnectedWallet() {
    const walletType = localStorage.getItem('walletType');
    const walletAddress = localStorage.getItem('walletAddress');

    console.log("🔍 Buscando wallet conectada...");
    console.log("🟡 Wallet en localStorage:", walletAddress);

    return walletAddress ? { walletType, walletAddress } : null;
}

// 📌 Firmar el mensaje correctamente (enviar en Base58)
export async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);

        const provider = getProvider(wallet);
        if (!provider) {
            throw new Error("❌ No hay una billetera conectada.");
        }

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);

        // 📌 Convertimos la firma a Base58
        const signatureBase58 = bs58.encode(new Uint8Array(signature));

        console.log("✅ Firma generada (Base58):", signatureBase58);

        return {
            signature: signatureBase58,
            message,
            pubkey: provider.publicKey.toBase58(),
        };
    } catch (error) {
        console.error(`❌ Error en signMessage():`, error);
        throw error;
    }
}

// 📌 Obtener el balance de la billetera en SOL
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) throw new Error("❌ Se requiere una dirección de wallet.");

        const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));
        const balance = await connection.getBalance(new PublicKey(walletAddress));
        return balance / 1e9; // Convertimos lamports a SOL
    } catch (error) {
        console.error("❌ Error obteniendo balance:", error);
        throw error;
    }
}
