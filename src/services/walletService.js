import bs58 from "bs58";
import { setToken } from "./tokenService";
import { authenticateWithServer, fetchWithAuth } from "./authServices";
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

// 📌 Conectar la billetera y obtener JWT
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

        // 📌 Si la wallet está conectada pero no ha firmado, la dejamos en estado "conectado pero no autenticado"
        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        if (!signedData.signature) {
            console.warn("⚠️ Wallet conectada pero sin autenticación. Esperando firma...");
            return { pubkey, status: "connected_unverified" }; // Estado intermedio
        }

        console.log("🔵 Firma generada:", signedData);
        const token = await authenticateWithServer(pubkey, signedData.signature, message);
        if (!token) throw new Error("❌ No se recibió un token válido.");

        console.log("✅ Token JWT recibido:", token);

        // 📌 Guardar en localStorage usando `setToken()`
        setToken(token);
        localStorage.setItem("walletAddress", pubkey);
        localStorage.setItem("walletType", wallet);
        window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet: pubkey } }));

        // 📌 Registrar wallet en el backend y manejar posibles errores
        try {
            const response = await fetchWithAuth("/api/auth/register-wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey }),
            });

            if (!response.ok) {
                console.warn("⚠️ La wallet ya estaba registrada o hubo un problema en el backend.");
            }
        } catch (error) {
            console.error("❌ Error registrando wallet en el backend:", error);
        }

        return { pubkey, status: "authenticated" };
    } catch (error) {
        console.error("❌ Error en connectWallet():", error);
        throw error;
    }
}

// 📌 Desconectar la billetera
async function disconnectWallet() {
    try {
        const walletType = localStorage.getItem("walletType");
        if (!walletType) throw new Error("❌ No hay wallet conectada.");

        const provider = getProvider(walletType);
        if (provider?.disconnect) {
            await provider.disconnect();
            console.log(`✅ ${walletType} Wallet desconectada.`);
        }

        localStorage.removeItem("walletAddress");
        localStorage.removeItem("walletType");
        localStorage.removeItem("jwtToken");
        window.dispatchEvent(new Event("walletDisconnected"));
    } catch (error) {
        console.error("❌ Error al desconectar la wallet:", error);
        throw error;
    }
}

// 📌 Obtener la billetera conectada
function getConnectedWallet() {
    return { walletAddress: localStorage.getItem("walletAddress") } || null;
}

// 📌 Obtener el balance de la billetera en SOL con control de errores
async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Intento de obtener balance sin dirección de wallet.");
            return 0; // No lanzar error, solo devolver 0
        }

        const connection = new Connection("https://rpc.ankr.com/solana"); // 🔹 Usamos un RPC más estable
        const balanceResponse = await connection.getBalance(new PublicKey(walletAddress));

        console.log("🔍 Respuesta de getBalance:", balanceResponse); // Debug

        // Si la respuesta no es un número, manejar el error
        if (typeof balanceResponse !== "number") {
            console.error("❌ Respuesta inesperada de getBalance:", balanceResponse);
            throw new Error("Error obteniendo balance. Respuesta inválida.");
        }

        return balanceResponse / 1e9; // Convertir de lamports a SOL
    } catch (error) {
        console.warn("⚠️ No se pudo obtener el balance (puede ser falta de firma).", error);
        return 0; // Evitar que la app se rompa
    }
}

// 📌 Firmar mensaje (enviar en Base58)
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

export { 
    getProvider, 
    connectWallet, 
    disconnectWallet, 
    getConnectedWallet, 
    getWalletBalance, 
    signMessage 
};
