// 🔹 Definir proveedores de wallets compatibles
const WALLET_PROVIDERS = {
    phantom: () => typeof window !== "undefined" && window.solana?.isPhantom ? window.solana : null,
    backpack: () => typeof window !== "undefined" && window.xnft?.solana || null,
    magiceden: () => typeof window !== "undefined" && window.magicEden?.solana || null,
    solflare: () => typeof window !== "undefined" && window.solflare?.isSolflare ? window.solflare : null,
    glow: () => typeof window !== "undefined" && window.glow?.solana || null,
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

    const provider = WALLET_PROVIDERS[wallet]();
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
    return Object.values(WALLET_PROVIDERS).some(providerFn => {
        const provider = providerFn();
        return provider?.isConnected || false;
    });
}

/**
 * 📡 **Detectar conexión y desconexión de cualquier wallet disponible**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    Object.entries(WALLET_PROVIDERS).forEach(([wallet, providerFn]) => {
        const provider = providerFn();
        if (!provider || !provider.on) return; // ✅ Evita registrar eventos en wallets sin soporte

        // ✅ Remueve eventos previos para evitar múltiples llamadas
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
    });
}
