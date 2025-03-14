// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => (typeof window !== "undefined" && window.solana?.isPhantom ? window.solana : null),
    backpack: () => (typeof window !== "undefined" && window.xnft?.solana ? window.xnft.solana : null),
    magiceden: () => (typeof window !== "undefined" && window.magicEden?.solana ? window.magicEden.solana : null),
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 */
export function getProvider(wallet) {
    return WALLET_PROVIDERS[wallet]?.() || null;
}

/**
 * 🔄 **Verificar si alguna wallet está conectada**
 */
export function isWalletConnected() {
    for (const wallet of Object.keys(WALLET_PROVIDERS)) {
        const provider = getProvider(wallet);
        
        if (!provider) continue;

        // ✅ Solo consideramos conectada si `isConnected === true`
        if (provider.isConnected && provider.publicKey) {
            return { wallet, pubkey: provider.publicKey.toBase58() };
        }
    }
    return null;
}
