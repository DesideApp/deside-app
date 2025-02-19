// Wallet Providers
const WALLET_PROVIDERS = {
    phantom: () => window.solana?.isPhantom && window.solana,
    backpack: () => window.xnft?.solana,
    magiceden: () => window.magicEden?.solana,
};

// Obtener el proveedor de la wallet
function getProvider(wallet) {
    const provider = WALLET_PROVIDERS[wallet]?.();
    if (!provider) {
        console.error(`❌ ${wallet} Wallet no detectada.`);
        return null;
    }
    return provider;
}

export { getProvider };
