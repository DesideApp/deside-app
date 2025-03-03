// 🔹 Definir proveedores de wallets compatibles
const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, etc.).
 * @returns {object|null} - Objeto del proveedor o null si no está disponible.
 */
export function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        console.error(`❌ ${wallet} Wallet no detectada.`);
        return null;
    }
    return provider;
}

/**
 * 🔄 **Verificar si la wallet ya está conectada**
 * @returns {boolean} - `true` si hay una wallet conectada, `false` en caso contrario.
 */
export function isWalletConnected() {
    return window.solana?.isConnected || false;
}

/**
 * 📡 **Detectar conexión y desconexión de la wallet**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    if (window.solana) {
        window.solana.on("connect", () => {
            console.log("✅ Wallet conectada.");
            if (onConnect) onConnect();
        });

        window.solana.on("disconnect", () => {
            console.warn("❌ Wallet desconectada.");
            if (onDisconnect) onDisconnect();
        });
    }
}
