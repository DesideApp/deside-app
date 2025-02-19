import { PublicKey, Connection } from "@solana/web3.js";
import { getProvider } from "./walletProviders";  

// **Obtener balance en SOL**
export async function getWalletBalance(walletAddress) {
    try {
        if (!walletAddress) {
            console.warn("⚠️ Intento de obtener balance sin dirección de wallet.");
            return 0;
        }
        const connection = new Connection("https://rpc.ankr.com/solana");
        const balanceResponse = await connection.getBalance(new PublicKey(walletAddress));
        return balanceResponse / 1e9;
    } catch {
        console.warn("⚠️ No se pudo obtener el balance.");
        return 0;
    }
}

// **Conectar la wallet**
export async function connectWallet(wallet) {
    try {
        console.log(`🔵 Conectando con ${wallet}...`);
        const provider = getProvider(wallet);
        if (!provider) return { pubkey: null, status: "error" };

        await provider.connect();
        const pubkey = provider.publicKey.toBase58();

        localStorage.setItem("walletAddress", pubkey);
        localStorage.setItem("walletType", wallet);

        return { pubkey, status: "connected" };
    } catch {
        return { pubkey: null, status: "error" };
    }
}

// **Desconectar la wallet**
export async function disconnectWallet() {
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletType");
}

// **Obtener estado de la wallet**
export async function getConnectedWallet() {
    const walletAddress = localStorage.getItem("walletAddress");
    const isAuthenticated = !!localStorage.getItem("jwtToken");

    return { walletAddress, isAuthenticated };
}
