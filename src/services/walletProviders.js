// 🔹 Definir proveedores de wallets compatibles
const WALLET_PROVIDERS = {
    phantom: () => window?.solana?.isPhantom ? window.solana : null,
    backpack: () => window?.xnft?.solana || null,
    magiceden: () => window?.magicEden?.solana || null,
    solflare: () => window?.solflare?.isSolflare ? window.solflare : null,
    glow: () => window?.glow?.solana || null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, etc.).
 * @returns {object|null} - Objeto del proveedor o `null` si no está disponible.
 */
export function getProvider(wallet) {
    if (!wallet || !WALLET_PROVIDERS[wallet]) {
        console.warn(`⚠️ Proveedor de wallet desconocido: ${wallet}`);
        return null;
    }

    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        console.warn(`⚠️ ${wallet} Wallet no detectada.`);
        return null;
    }

    return provider;
}

/**
 * 🔄 **Verificar si alguna wallet está conectada**
 * @returns {boolean} - `true` si hay una wallet conectada, `false` en caso contrario.
 */
export function isWalletConnected() {
    return Object.values(WALLET_PROVIDERS).some(getProvider => getProvider()?.isConnected);
}

/**
 * 📡 **Detectar conexión y desconexión de cualquier wallet disponible**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    Object.entries(WALLET_PROVIDERS).forEach(([wallet, providerFn]) => {
        const provider = providerFn();
        if (provider) {
            // ✅ Evita múltiples registros de eventos en la misma instancia
            provider.removeAllListeners?.("connect");
            provider.removeAllListeners?.("disconnect");

            provider.on("connect", () => {
                console.log(`✅ ${wallet} Wallet conectada.`);
                onConnect?.(wallet);
            });

            provider.on("disconnect", () => {
                console.warn(`❌ ${wallet} Wallet desconectada.`);
                onDisconnect?.(wallet);
            });
        }
    });
}
