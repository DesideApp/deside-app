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
