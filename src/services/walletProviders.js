/**
 * 📂 walletProviders.js - Detecta wallets compatibles con Solana (Phantom, Backpack, Magic Eden)
 */

// Constantes para tipos de wallets
const WALLET_TYPES = {
  PHANTOM: 'phantom',
  BACKPACK: 'backpack',
  MAGIC_EDEN: 'magiceden',
  UNKNOWN: 'desconocida',
};

// Constantes para nombres de wallets (UI)
const WALLET_NAMES = {
  [WALLET_TYPES.PHANTOM]: 'Phantom',
  [WALLET_TYPES.BACKPACK]: 'Backpack',
  [WALLET_TYPES.MAGIC_EDEN]: 'Magic Eden Wallet',
  [WALLET_TYPES.UNKNOWN]: 'Desconocida',
};

// URLs de descarga para cada wallet
const WALLET_DOWNLOAD_URLS = {
  [WALLET_TYPES.PHANTOM]: 'https://phantom.app/',
  [WALLET_TYPES.BACKPACK]: 'https://www.backpack.app/',
  [WALLET_TYPES.MAGIC_EDEN]: 'https://wallet.magiceden.io/',
};

/**
 * 🔎 Obtiene el proveedor de Solana según el tipo especificado.
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden").
 * @returns {Object|null} Proveedor o null.
 */
export const getProvider = (walletType) => {
  if (typeof window === 'undefined') return null; // Verificar entorno

  if (walletType === WALLET_TYPES.PHANTOM) {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) return provider;
    }
    console.warn(`[WalletProviders] ❌ Phantom no detectado. Por favor, instala la extensión.`);
    return null;
  }

  if (walletType === WALLET_TYPES.BACKPACK) {
    if ('backpack' in window) {
      const provider = window.backpack;
      if (provider?.isBackpack) return provider;
    }
    console.warn(`[WalletProviders] ❌ Backpack no detectado. Por favor, instala la extensión.`);
    return null;
  }

  if (walletType === WALLET_TYPES.MAGIC_EDEN) {
    if ('magicEden' in window) {
      const provider = window.magicEden?.solana;
      if (provider?.isMagicEdenWallet) return provider;
    }
    console.warn(`[WalletProviders] ❌ Magic Eden Wallet no detectado. Por favor, instala la extensión.`);
    return null;
  }

  console.warn(`[WalletProviders] ⚠️ Tipo de wallet desconocido: ${walletType}`);
  return null;
};

/**
 * 🏷️ Identifica el tipo de wallet conectada.
 * @param {Object} [provider] - Proveedor de wallet (opcional).
 * @returns {string} Nombre de la wallet.
 */
export const getWalletType = (provider = getProvider()) => {
  if (!provider) return WALLET_NAMES[WALLET_TYPES.UNKNOWN];

  if (provider.isPhantom) return WALLET_NAMES[WALLET_TYPES.PHANTOM];
  if (provider.isBackpack) return WALLET_NAMES[WALLET_TYPES.BACKPACK];
  if (provider.isMagicEdenWallet) return WALLET_NAMES[WALLET_TYPES.MAGIC_EDEN];

  return WALLET_NAMES[WALLET_TYPES.UNKNOWN];
};

/**
 * 🌐 Muestra un mensaje para descargar la wallet si no está instalada.
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden").
 */
export const redirectToWalletDownload = (walletType) => {
  const url = WALLET_DOWNLOAD_URLS[walletType];
  if (url) {
    alert(`Por favor, instala la extensión de ${WALLET_NAMES[walletType]} desde: ${url}`);
  } else {
    console.warn(`[WalletProviders] ⚠️ No se encontró URL de descarga para ${walletType}`);
  }
};

// ✅ EXPORTAMOS TODO LO NECESARIO PARA EVITAR ERRORES EN OTROS ARCHIVOS
export { WALLET_TYPES, WALLET_NAMES };
