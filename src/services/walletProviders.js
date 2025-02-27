// 🔹 Mapeo de Proveedores de Wallets Compatibles
const WALLET_PROVIDERS = {
    phantom: () => typeof window !== "undefined" && window.solana?.isPhantom ? window.solana : null,
    backpack: () => typeof window !== "undefined" && window.xnft?.solana ? window.xnft.solana : null,
    magiceden: () => typeof window !== "undefined" && window.magicEden?.solana ? window.magicEden.solana : null,
};

/**
 * 🔍 **Obtener el proveedor de la wallet**
 * @param {string} wallet - Nombre del proveedor de wallet ("phantom", "backpack", "magiceden").
 * @returns {object|null} - Instancia del proveedor o `null` si no está disponible.
 */
function getProvider(wallet) {
    if (!wallet || !WALLET_PROVIDERS[wallet]) {
        console.warn(`⚠️ Wallet '${wallet}' no soportada.`);
        return null;
    }

    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        console.warn(`❌ ${wallet} Wallet no detectada en el navegador.`);
    }
    return provider;
}

export { getProvider, WALLET_PROVIDERS };
