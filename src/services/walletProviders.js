// walletProviders.js - Corrección DEFINITIVA según docs oficiales

const WALLET_TYPES = {
  PHANTOM: 'phantom',
  BACKPACK: 'backpack',
  MAGIC_EDEN: 'magiceden',
  UNKNOWN: 'unknown',
};

const WALLET_NAMES = {
  [WALLET_TYPES.PHANTOM]: 'Phantom',
  [WALLET_TYPES.BACKPACK]: 'Backpack',
  [WALLET_TYPES.MAGIC_EDEN]: 'Magic Eden Wallet',
  [WALLET_TYPES.UNKNOWN]: 'Unknown Wallet',
};

const WALLET_DOWNLOAD_URLS = {
  [WALLET_TYPES.PHANTOM]: 'https://phantom.app/',
  [WALLET_TYPES.BACKPACK]: 'https://www.backpack.app/',
  [WALLET_TYPES.MAGIC_EDEN]: 'https://wallet.magiceden.io/',
};

/**
 * 🔎 Obtiene el proveedor específico o fallback global
 */
export const getProvider = (walletType) => {
  switch (walletType) {
    case WALLET_TYPES.PHANTOM:
      if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
      break;

    case WALLET_TYPES.BACKPACK:
      if (window.backpack?.isBackpack) return window.backpack;
      if (window.solana?.isBackpack) return window.solana; // fallback seguro
      break;

    case WALLET_TYPES.MAGIC_EDEN:
      if (window.magicEden?.solana?.isMagicEden) return window.magicEden.solana;
      break;

    default:
      // Fallback para detectar cualquier wallet compatible automáticamente:
      if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
      if (window.backpack?.isBackpack) return window.backpack;
      if (window.solana?.isBackpack) return window.solana;
      if (window.magicEden?.solana?.isMagicEden) return window.magicEden.solana;
      if (window.solana?.isPhantom) return window.solana; // legacy Phantom
      return null;
  }

  return null;
};

/**
 * 🏷️ Identifica el tipo exacto de wallet
 */
export const getWalletType = (provider) => {
  if (!provider) return WALLET_NAMES[WALLET_TYPES.UNKNOWN];

  if (provider.isPhantom) return WALLET_NAMES[WALLET_TYPES.PHANTOM];
  if (provider.isBackpack) return WALLET_NAMES[WALLET_TYPES.BACKPACK];
  if (provider.isMagicEden) return WALLET_NAMES[WALLET_TYPES.MAGIC_EDEN];

  return WALLET_NAMES[WALLET_TYPES.UNKNOWN];
};

export { WALLET_TYPES, WALLET_NAMES, WALLET_DOWNLOAD_URLS };
