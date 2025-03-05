// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => (typeof window !== "undefined" && window.solana?.isPhantom) ? window.solana : null,
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
    return WALLET_PROVIDERS[wallet]();
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

        provider.removeAllListeners?.("connect");
        provider.removeAllListeners?.("disconnect");

        provider.on("connect", () => {
            console.log(`✅ ${wallet} Wallet conectada.`);
            onConnect?.(wallet);
            window.dispatchEvent(new Event("walletConnected"));
        });

        provider.on("disconnect", () => {
            console.warn(`❌ ${wallet} Wallet desconectada.`);
            onDisconnect?.(wallet);
            window.dispatchEvent(new Event("walletDisconnected"));
        });
    });
}
