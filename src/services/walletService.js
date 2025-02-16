import bs58 from "bs58";
import { setToken, getToken, removeToken, refreshToken } from "./tokenService";
import { authenticateWithServer } from "./authServices";
import { PublicKey, Connection } from "@solana/web3.js";

const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

// Obtiene el proveedor de la wallet
function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) throw new Error(`❌ ${wallet} Wallet no detectada.`);
    return provider;
}

// Verificar si una wallet está registrada en el backend
async function isWalletRegistered(pubkey) {
    try {
        const response = await fetch(`/api/auth/check-wallet?pubkey=${pubkey}`);
        const data = await response.json();
        return data.isRegistered;
    } catch (error) {
        console.error("❌ Error al verificar wallet registrada:", error);
        return false;
    }
}

// Conectar la wallet (forzando el desbloqueo si es necesario)
async function connectWallet(wallet) {
    try {
        console.log(`🔵 Intentando conectar con ${wallet}`);
        const provider = getProvider(wallet);

        if (!provider.isConnected) {
            console.log(`⚠️ ${wallet} detectado pero no conectado. Conectando...`);
            await provider.connect();
        }

        if (!provider.publicKey) {
            console.log(`⚠️ ${wallet} sin publicKey. Intentando reconectar...`);
            await provider.connect();
        }

        if (!provider.publicKey) {
            throw new Error("❌ No se pudo obtener la publicKey. Desbloquea la wallet.");
        }

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

// Autenticar wallet y obtener JWT
async function authenticateWallet(wallet) {
    try {
        const pubkey = localStorage.getItem("walletAddress");
        if (!pubkey) throw new Error("❌ No hay wallet conectada.");

        const registered = await isWalletRegistered(pubkey);
        if (!registered) {
            console.warn("⚠️ Wallet no registrada, registrando automáticamente...");
            await registerWallet(pubkey);
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

// Obtener balance en SOL
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

// Desconectar la wallet
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

// Firmar mensaje con la wallet
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

// Obtener estado de conexión de la wallet
async function getConnectedWallet() {
    const walletAddress = localStorage.getItem("walletAddress");
    let token = getToken();

    if (!token || isTokenExpired()) {
        console.log("🔄 Intentando renovar token...");
        try {
            token = await refreshToken();
        } catch (error) {
            console.warn("❌ No se pudo renovar el token.");
            removeToken();
        }
    }

    return { walletAddress, isAuthenticated: !!token };
}

// Registrar wallet en backend si no está registrada
async function registerWallet(pubkey) {
    try {
        const response = await fetch("/api/auth/register-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pubkey }),
        });

        if (!response.ok) throw new Error("❌ Error registrando wallet.");
        console.log(`✅ Wallet ${pubkey} registrada correctamente.`);
    } catch (error) {
        console.error("❌ Error en registerWallet():", error);
        throw error;
    }
}

export {
    getProvider,
    connectWallet,
    authenticateWallet,
    disconnectWallet,
    getConnectedWallet,
    getWalletBalance,
    signMessage,
    registerWallet,
};
