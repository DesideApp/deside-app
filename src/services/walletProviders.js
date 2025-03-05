// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => {
        if (typeof window === "undefined") return null;
        if (window.solana?.isPhantom) return window.solana;
        return window.solana || null; // ✅ Asegura que use `window.solana` incluso si hay más de una wallet
    },
    backpack: () => (typeof window !== "undefined" && window.xnft?.solana) ? window.xnft.solana : null,
    magiceden: () => (typeof window !== "undefined" && window.magicEden?.solana) ? window.magicEden.solana : null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, magiceden).
 * @returns {object|null} - Objeto del proveedor si está disponible, `null` si no lo está.
 */
export function getProvider(wallet) {
    if (!wallet || !WALLET_PROVIDERS[wallet]) {
        console.warn(`⚠️ Proveedor de wallet desconocido: ${wallet}`);
        return null;
    }
    const provider = WALLET_PROVIDERS[wallet]();
    if (!provider) console.warn(`⚠️ ${wallet} Wallet no detectada.`);
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
 * 📡 **Escuchar eventos de conexión/desconexión de wallets**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    Object.entries(WALLET_PROVIDERS).forEach(([wallet, providerFn]) => {
        const provider = providerFn();
        if (!provider || !provider.on) return;

        // ✅ Remueve eventos previos para evitar múltiples llamadas innecesarias
        provider.removeAllListeners?.("connect");
        provider.removeAllListeners?.("disconnect");

        provider.on("connect", () => {
            console.log(`✅ ${wallet} Wallet conectada.`);
            onConnect?.(wallet);
            window.dispatchEvent(new Event("walletConnected")); // 🔄 Emitir evento global
        });

        provider.on("disconnect", () => {
            console.warn(`❌ ${wallet} Wallet desconectada.`);
            onDisconnect?.(wallet);
            window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Emitir evento global
        });
    });
}
