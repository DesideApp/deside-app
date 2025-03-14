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

        // ✅ Ahora solo consideramos conectada si `isConnected === true`
        if (provider.isConnected && provider.publicKey) {
            return { wallet, pubkey: provider.publicKey.toBase58() };
        }
    }
    return null;
}

/**
 * 📡 **Escuchar eventos de conexión/desconexión de wallets**
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    Object.entries(WALLET_PROVIDERS).forEach(([wallet, providerFn]) => {
        const provider = providerFn();
        if (!provider || !provider.on) return;

        // 🔄 **Eliminar eventos previos antes de registrar nuevos**
        provider.off?.("connect");
        provider.off?.("disconnect");

        provider.on("connect", () => {
            if (provider.publicKey) {
                onConnect?.(wallet);
                window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet, pubkey: provider.publicKey.toBase58() } }));
            }
        });

        provider.on("disconnect", () => {
            onDisconnect?.(wallet);
            window.dispatchEvent(new CustomEvent("walletDisconnected", { detail: { wallet } }));
        });
    });
}
