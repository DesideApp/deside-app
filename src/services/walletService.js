import bs58 from "bs58";
import { setToken, getToken, removeToken } from "./tokenService";
import { authenticateWithServer } from "./authServices";
import { PublicKey, Connection } from "@solana/web3.js";

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

// 📌 Verifica el estado de conexión y autenticación
function getWalletStatus() {
    const pubkey = localStorage.getItem("walletAddress");
    const token = getToken();

    if (!pubkey) return { status: "disconnected", pubkey: null };
    if (!token) return { status: "connected", pubkey };

    return { status: "authenticated", pubkey };
}

// 📌 Conectar la billetera
async function connectWallet(wallet) {
    try {
        console.log(`🔵 Intentando conectar con ${wallet}`);
        const provider = getProvider(wallet);

        if (!provider.isConnected) {
            console.log(`⚠️ ${wallet} detectado pero no conectado. Conectando...`);
            await provider.connect();
        }

        if (!provider.publicKey) throw new Error("❌ Conexión cancelada por el usuario.");

        const pubkey = provider.publicKey.toBase58();
        console.log(`✅ ${wallet} conectado: ${pubkey}`);

        localStorage.setItem("walletAddress", pubkey);
        localStorage.setItem("walletType", wallet);
        window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet: pubkey } }));

        return { pubkey, status: "connected" };
    } catch (error) {
        console.error("❌ Error en connectWallet():", error);
        throw error;
    }
}

// 📌 Autenticar y obtener JWT solo si es necesario
async function authenticateWallet(wallet) {
    try {
        const pubkey = localStorage.getItem("walletAddress");
        if (!pubkey) throw new Error("❌ No hay wallet conectada.");

        if (getToken()) {
            console.log("✅ Ya autenticado. No es necesario firmar de nuevo.");
            return { pubkey, status: "authenticated" };
        }

        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        if (!signedData.signature) throw new Error("❌ Firma rechazada.");

        console.log("🔵 Firma generada:", signedData);
        const token = await authenticateWithServer(pubkey, signedData.signature, message);
        if (!token) throw new Error("❌ No se recibió un token válido.");

        console.log("✅ Token JWT recibido y almacenado.");
        setToken(token);

        return { pubkey, status: "authenticated" };
    } catch (error) {
        console.error("❌ Error en authenticateWallet():", error);
        throw error;
    }
}

// 📌 Desconectar la wallet
async function disconnectWallet() {
    try {
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("walletType");
        removeToken();
        window.dispatchEvent(new Event("walletDisconnected"));
        console.log("✅ Wallet desconectada.");
    } catch (error) {
        console.error("❌ Error al desconectar la wallet:", error);
        throw error;
    }
}

export { 
    getProvider, 
    connectWallet, 
    authenticateWallet,
    disconnectWallet, 
    getWalletStatus
};
