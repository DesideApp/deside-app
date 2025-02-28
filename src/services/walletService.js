import { PublicKey, Connection } from "@solana/web3.js";
import { getProvider } from "./walletProviders";  

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://rpc.ankr.com/solana";

/**
 * 🔹 **Obtener balance en SOL**
 */
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Intento de obtener balance sin dirección de wallet.");
            return 0;
        }
        const connection = new Connection(SOLANA_RPC_URL, "confirmed");
        const balanceResponse = await connection.getBalance(new PublicKey(walletAddress));
        return balanceResponse / 1e9;
    } catch (error) {
        console.warn("⚠️ No se pudo obtener el balance:", error);
        return 0;
    }
}

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
