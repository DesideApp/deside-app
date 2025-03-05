// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => {
        if (typeof window === "undefined") return null;
        return window.solana?.isPhantom ? window.solana : null; // ✅ Detecta Phantom
    },
    backpack: () => {
        if (typeof window === "undefined") return null;
        return window.xnft?.solana ? window.xnft.solana : null; // ✅ Detecta Backpack
    },
    magiceden: () => {
        if (typeof window === "undefined") return null;
        return window.magicEden?.solana ? window.magicEden.solana : null; // ✅ Detecta MagicEden
    },
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
    return Object.entries(WALLET_PROVIDERS).some(([wallet, providerFn]) => {
        const provider = providerFn();
        if (provider?.isConnected) {
            console.log(`✅ Wallet detectada conectada: ${wallet}`);
            return true;
        }
        return false;
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

        console.log(`🔍 Escuchando eventos de conexión en: ${wallet}`);

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
