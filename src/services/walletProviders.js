// 🔹 **Definir proveedores de wallets compatibles**
const WALLET_PROVIDERS = {
    phantom: () => window?.solana?.isPhantom ? window.solana : null,
    backpack: () => window?.xnft?.solana || null,
    magiceden: () => window?.magicEden?.solana || null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, magiceden).
 * @returns {object|null} - Objeto del proveedor si está disponible, `null` si no lo está.
 */
export function getProvider(wallet) {
    return WALLET_PROVIDERS[wallet]?.() || null;
}

/**
 * 🔄 **Verificar si alguna wallet está conectada**
 * @returns {string|null} - Nombre de la wallet conectada o `null` si ninguna está conectada.
 */
export function isWalletConnected() {
    return Object.keys(WALLET_PROVIDERS).find(wallet => getProvider(wallet)?.isConnected) || null;
}

/**
 * 📡 **Escuchar eventos de conexión/desconexión de wallets**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    Object.entries(WALLET_PROVIDERS).forEach(([wallet, providerFn]) => {
        const provider = providerFn();
        if (!provider?.on) return;

        provider.off?.("connect");
        provider.off?.("disconnect");

        provider.on("connect", () => {
            onConnect?.(wallet);
            window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet } }));
        });

        provider.on("disconnect", () => {
            onDisconnect?.(wallet);
            window.dispatchEvent(new CustomEvent("walletDisconnected", { detail: { wallet } }));
        });
    });
}
