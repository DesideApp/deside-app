// 🔹 Definir proveedores de wallets compatibles
const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom ? window.solana : null,
    backpack: () => window.xnft?.solana || null,
    magiceden: () => window.magicEden?.solana || null,
    solflare: () => window.solflare?.isSolflare ? window.solflare : null,
    glow: () => window.glow?.solana || null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, etc.).
 * @returns {object|null} - Objeto del proveedor o null si no está disponible.
 */
export function getProvider(wallet) {
    if (!WALLET_PROVIDERS[wallet]) {
        console.error(`❌ Proveedor desconocido: ${wallet}`);
        return null;
    }

    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        console.warn(`⚠️ ${wallet} Wallet no detectada.`);
        return null;
    }
    
    console.log(`✅ Proveedor detectado: ${wallet}`);
    return provider;
}

/**
 * 🔄 **Verificar si alguna wallet está conectada**
 * @returns {boolean} - `true` si hay una wallet conectada, `false` en caso contrario.
 */
export function isWalletConnected() {
    return Object.values(WALLET_PROVIDERS).some(getProvider => getProvider()?.isConnected) || false;
}

/**
 * 📡 **Detectar conexión y desconexión de la wallet**
 * @param {function} onConnect - Callback cuando la wallet se conecta.
 * @param {function} onDisconnect - Callback cuando la wallet se desconecta.
 */
export function listenToWalletEvents(onConnect, onDisconnect) {
    const solanaProvider = getProvider("phantom"); // ✅ Detectamos Phantom por defecto
    if (solanaProvider) {
        solanaProvider.on("connect", () => {
            console.log("✅ Wallet conectada.");
            if (onConnect) onConnect();
        });

        solanaProvider.on("disconnect", () => {
            console.warn("❌ Wallet desconectada.");
            if (onDisconnect) onDisconnect();
        });
    } else {
        console.warn("⚠️ No hay wallets detectadas para escuchar eventos.");
    }
}
