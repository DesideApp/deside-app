// 🔹 **Detectar y obtener el proveedor Phantom**
export function getPhantomProvider() {
    return typeof window !== "undefined" && window.phantom?.solana?.isPhantom
        ? window.phantom.solana
        : null;
}

/**
 * 🔄 **Verificar si Phantom está conectado**
 */
export function isPhantomConnected() {
    const provider = getPhantomProvider();
    return provider?.isConnected && provider.publicKey
        ? { wallet: "phantom", pubkey: provider.publicKey.toBase58() }
        : null;
}

/**
 * 💰 **Obtener balance de la wallet conectada directamente desde el proveedor**
 */
export async function getPhantomBalance() {
    try {
        const provider = getPhantomProvider();
        if (!provider?.isConnected || !provider.publicKey) return null;

        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'));
        const balanceLamports = await connection.getBalance(provider.publicKey);
        return balanceLamports / solanaWeb3.LAMPORTS_PER_SOL; // Convertir lamports a SOL
    } catch (error) {
        console.error("❌ Error obteniendo balance de Phantom:", error);
        return null;
    }
}
