import { getProvider } from "./walletProviders";  
import { authenticateWithServer } from "./apiService"; // ✅ Unificamos autenticación
import bs58 from "bs58"; // Codificación Base58

/**
 * 🔹 **Conectar la wallet**
 */
export async function connectWallet(wallet) {
    try {
        console.log(`🔵 Conectando con ${wallet}...`);
        const provider = getProvider(wallet);
        if (!provider) return { pubkey: null, status: "error" };

        await provider.connect();
        const pubkey = provider.publicKey.toBase58();
        
        console.log(`✅ Wallet conectada: ${pubkey}`);
        return { pubkey, status: "connected" };
    } catch (error) {
        console.error("❌ Error conectando wallet:", error);
        return { pubkey: null, status: "error" };
    }
}

/**
 * 🔹 **Desconectar la wallet**
 */
export async function disconnectWallet() {
    try {
        if (window.solana && window.solana.disconnect) {
            await window.solana.disconnect();
        }
        console.log("🔴 Wallet desconectada correctamente.");
    } catch (error) {
        console.error("❌ Error desconectando wallet:", error);
    }
}

/**
 * 🔹 **Obtener estado de la wallet**
 */
export async function getConnectedWallet() {
    try {
        if (!window.solana || !window.solana.isConnected) {
            return { walletAddress: null, isAuthenticated: false };
        }

        const walletAddress = window.solana.publicKey ? window.solana.publicKey.toBase58() : null;
        console.log(`✅ Wallet detectada: ${walletAddress}`);

        // 🔥 **Nuevo: Comprobamos si está autenticada en el backend**
        const authResponse = await fetch("/api/auth/status", {
            method: "GET",
            credentials: "include",
        });

        const authData = await authResponse.json();
        const isAuthenticated = authData.isAuthenticated || false;

        return { walletAddress, isAuthenticated };
    } catch (error) {
        console.error("❌ Error obteniendo estado de la wallet:", error);
        return { walletAddress: null, isAuthenticated: false };
    }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
    try {
        console.log(`🟡 Solicitando firma a ${wallet}...`);
        const provider = getProvider(wallet);
        if (!provider) return { signature: null, error: "No provider found" };

        const encodedMessage = new TextEncoder().encode(message);
        const { signature } = await provider.signMessage(encodedMessage);
        const signatureBase58 = bs58.encode(signature);

        console.log("✅ Firma generada:", signatureBase58);
        return { signature: signatureBase58, message, pubkey: provider.publicKey.toBase58() };
    } catch (error) {
        console.error("❌ Error en signMessage():", error.message || error);
        return { signature: null, error: error.message || error };
    }
}

/**
 * 🔹 **Autenticar wallet con el backend**
 */
export async function authenticateWallet(wallet) {
    try {
        const { walletAddress } = await getConnectedWallet();
        if (!walletAddress) {
            console.warn("⚠️ No hay wallet conectada. Se requiere conexión antes de autenticar.");
            return { pubkey: null, status: "not_connected" };
        }

        console.log("🔄 Iniciando autenticación...");
        const message = "Please sign this message to authenticate.";
        const signedData = await signMessage(wallet, message);
        if (!signedData.signature) throw new Error("❌ Firma rechazada.");

        console.log("🔵 Enviando firma al backend...");
        const response = await authenticateWithServer(
            signedData.pubkey, 
            signedData.signature, 
            message
        );

        if (!response || !response.message) {
            throw new Error("❌ Respuesta inválida del backend.");
        }

        console.log("✅ Autenticación exitosa en backend.");
        return { pubkey: walletAddress, status: "authenticated" };
    } catch (error) {
        console.error("❌ Error en authenticateWallet():", error.message || error);
        return { pubkey: null, status: "error" };
    }
}
