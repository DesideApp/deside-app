// 🔹 Proveedores de wallets compatibles
const WALLET_PROVIDERS = {
    phantom: () => typeof window !== "undefined" && window.solana?.isPhantom ? window.solana : null,
    backpack: () => typeof window !== "undefined" && window.xnft?.solana || null,
    magiceden: () => typeof window !== "undefined" && window.magicEden?.solana || null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor (phantom, backpack, etc.).
 * @returns {object} - Objeto del proveedor o `null` si no está disponible.
 */
export function getProvider(wallet) {
    if (!wallet || !WALLET_PROVIDERS[wallet]) {
        console.warn(`⚠️ Proveedor de wallet desconocido: ${wallet}`);
        return null;
    }
    return WALLET_PROVIDERS[wallet]();
}

/**
 * 🔄 **Verificar si hay una wallet conectada**
 * @returns {boolean} - `true` si hay una wallet conectada, `false` en caso contrario.
 */
export function isWalletConnected() {
    return Object.values(WALLET_PROVIDERS).some(providerFn => {
        const provider = providerFn();
        return provider?.isConnected || false;
    });
}

/**
 * 💰 **Obtener balance de una wallet conectada**
 * @param {string} walletName - Nombre del proveedor (phantom, backpack, etc.).
 * @returns {Promise<number|null>} - Balance en SOL o `null` en caso de error.
 */
export async function getWalletBalance(walletName) {
    try {
        const provider = getProvider(walletName);
        if (!provider || !provider.publicKey) throw new Error("No se encontró una wallet conectada.");

        const balance = await provider.connection.getBalance(provider.publicKey);
        return balance / 1e9; // Convertir de lamports a SOL
    } catch (error) {
        console.error(`❌ Error obteniendo balance para ${walletName}:`, error);
        return null;
    }
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
