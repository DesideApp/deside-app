// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => (typeof window !== "undefined" && window.solana?.isPhantom ? window.solana : null),
    backpack: () => (typeof window !== "undefined" && window.xnft?.solana ? window.xnft.solana : null),
    magiceden: () => (typeof window !== "undefined" && window.magicEden?.solana ? window.magicEden.solana : null),
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
 * @returns {string|null} - Nombre de la wallet conectada o `null` si ninguna está conectada.
 */
export function isWalletConnected() {
    for (const [wallet, providerFn] of Object.entries(WALLET_PROVIDERS)) {
        const provider = providerFn();
        if (provider?.isConnected) {
            console.log(`✅ Wallet detectada conectada: ${wallet}`);
            return wallet;
        }
    }
    return null;
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

        // ✅ Eliminar eventos antiguos ANTES de asignar nuevos
        provider.off?.("connect");
        provider.off?.("disconnect");

        provider.on("connect", () => {
            console.log(`✅ ${wallet} Wallet conectada.`);
            onConnect?.(wallet);
            window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet } }));
        });

        provider.on("disconnect", () => {
            console.warn(`❌ ${wallet} Wallet desconectada.`);
            onDisconnect?.(wallet);
            window.dispatchEvent(new CustomEvent("walletDisconnected", { detail: { wallet } }));
        });
    });
}
