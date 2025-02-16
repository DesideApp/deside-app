import bs58 from "bs58";
import { setToken, getToken } from "./tokenService";
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

// 📌 Autenticar y obtener JWT
async function authenticateWallet(wallet) {
    try {
        const pubkey = localStorage.getItem("walletAddress");
        if (!pubkey) throw new Error("❌ No hay wallet conectada.");

        // Evitar pedir firma si ya está autenticado
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

// 📌 Obtener balance en SOL
async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Intento de obtener balance sin dirección de wallet.");
            return 0;
        }

        const connection = new Connection("https://rpc.ankr.com/solana");
        const balanceResponse = await connection.getBalance(new PublicKey(walletAddress));

        if (typeof balanceResponse !== "number") throw new Error("❌ Respuesta inesperada de getBalance.");

        return balanceResponse / 1e9;
    } catch (error) {
        console.warn("⚠️ No se pudo obtener el balance. Es posible que la firma sea necesaria.");
        return 0;
    }
}

// 📌 Desconectar la wallet
async function disconnectWallet() {
    try {
        localStorage.removeItem("walletAddress");
        localStorage.removeItem("walletType");
        localStorage.removeItem("jwtToken");
        window.dispatchEvent(new Event("walletDisconnected"));
        console.log("✅ Wallet desconectada.");
    } catch (error) {
        console.error("❌ Error al desconectar la wallet:", error);
        throw error;
    }
}

// 📌 Firmar mensaje
async function signMessage(wallet, message) {
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

// 📌 Obtener la billetera conectada
function getConnectedWallet() {
    return { walletAddress: localStorage.getItem("walletAddress") } || null;
}

export { 
    getProvider, 
    connectWallet, 
    authenticateWallet,
    disconnectWallet, 
    getConnectedWallet, 
    getWalletBalance, 
    signMessage 
};
