import bs58 from 'bs58';
import { authenticateWithServer } from './authServices';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';

const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

// 📌 Obtiene el proveedor de la billetera
function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) throw new Error(`❌ ${wallet} Wallet no detectada.`);
    return provider;
}

// 📌 Conectar la billetera y obtener JWT
export async function connectWallet(wallet) {
    try {
        console.log(`🔵 Intentando conectar con ${wallet}`);
        const provider = getProvider(wallet);
        
        if (!provider.isConnected) {
            await provider.connect();
        }

        if (!provider.publicKey) throw new Error("❌ Conexión cancelada por el usuario.");
        const pubkey = provider.publicKey.toBase58();
        console.log(`✅ ${wallet} conectado: ${pubkey}`);

        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);

        if (!signedData.signature) {
            throw new Error("❌ No se pudo obtener la firma.");
        }

        console.log("🔵 Firma generada:", signedData);

        const token = await authenticateWithServer(pubkey, signedData.signature, message);

        if (!token) {
            throw new Error("❌ No se recibió un token válido.");
        }

        console.log("✅ Token JWT recibido:", token);

        // 📌 Guardar datos en localStorage y emitir un evento global
        localStorage.setItem("walletAddress", pubkey);
        localStorage.setItem("jwtToken", token); // Aseguramos que el token se almacene correctamente
        window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet: pubkey } }));

        return pubkey;
    } catch (error) {
        console.error("❌ Error en connectWallet():", error);
        throw error;
    }
}

// 📌 Desconectar la billetera
export async function disconnectWallet() {
    try {
        const walletType = localStorage.getItem("walletType");
        if (!walletType) throw new Error("❌ No hay wallet conectada.");

        const provider = getProvider(walletType);
        if (provider?.disconnect) {
            await provider.disconnect();
            console.log(`✅ ${walletType} Wallet desconectada.`);
        }

        localStorage.removeItem("walletAddress");
        localStorage.removeItem("jwtToken");
        window.dispatchEvent(new Event("walletDisconnected"));
    } catch (error) {
        console.error("❌ Error al desconectar la wallet:", error);
        throw error;
    }
}

// 📌 Obtener la billetera conectada
export function getConnectedWallet() {
    const walletAddress = localStorage.getItem("walletAddress");
    return walletAddress ? { walletAddress } : null;
}

// 📌 Firmar mensaje (enviar en Base58)
export async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);
        const provider = getProvider(wallet);
        if (!provider) throw new Error("❌ No hay una billetera conectada.");

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);
        const signatureBase58 = bs58.encode(signature);

        console.log("✅ Firma generada (Base58):", signatureBase58);
        return { signature: signatureBase58, message, pubkey: provider.publicKey.toBase58() };
    } catch (error) {
        console.error("❌ Error en signMessage():", error);
        throw error;
    }
}

// 📌 Obtener el balance de la billetera en SOL
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) throw new Error("❌ Se requiere una dirección de wallet.");

        const connection = new Connection(clusterApiUrl("mainnet-beta"));
        const balance = await connection.getBalance(new PublicKey(walletAddress));

        if (!balance) throw new Error("❌ No se pudo obtener el balance de la cuenta.");
        return balance / 1e9;
    } catch (error) {
        console.error("❌ Error obteniendo balance:", error);
        throw error;
    }
}
