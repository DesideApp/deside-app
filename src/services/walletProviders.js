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
  [WALLET_TYPES.UNKNOWN]: 'Unknown Wallet',
};

// URLs de descarga para cada wallet (para mostrar en la UI si no está instalada)
const WALLET_DOWNLOAD_URLS = {
  [WALLET_TYPES.PHANTOM]: 'https://phantom.app/',
  [WALLET_TYPES.BACKPACK]: 'https://www.backpack.app/',
  [WALLET_TYPES.MAGIC_EDEN]: 'https://wallet.magiceden.io/',
};

/**
 * 🔎 Obtiene el proveedor de Solana según el tipo especificado.
 * @param {string} [walletType] - Tipo de wallet ("phantom", "backpack", "magiceden").
 * @returns {Object|null} Proveedor de la wallet o null si no se encuentra.
 */
export const getProvider = (walletType) => {
  if (!window.solana) return null;

  // Si no se especifica una wallet, devolver `window.solana` como fallback estándar
  if (!walletType) return window.solana;

  // Detección basada en las propiedades estándar de cada wallet
  if (window.solana.isPhantom && walletType === WALLET_TYPES.PHANTOM) return window.solana;
  if (window.solana.isBackpack && walletType === WALLET_TYPES.BACKPACK) return window.solana;
  if (window.solana.isMagicEdenWallet && walletType === WALLET_TYPES.MAGIC_EDEN) return window.solana;

  return null; // No se encontró un proveedor compatible
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
 * 🌐 Muestra un mensaje amigable si la wallet no está instalada.
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden").
 */
export const showWalletNotInstalledMessage = (walletType) => {
  const url = WALLET_DOWNLOAD_URLS[walletType];
  if (url) {
    console.warn(`[WalletProviders] ⚠️ ${walletType} is not installed.`);
    alert(
      `It looks like ${WALLET_NAMES[walletType]} is not installed.\n\n` +
      `If you're interested, you can download it here:\n${url}`
    );
  } else {
    console.warn(`[WalletProviders] ⚠️ No download URL found for ${walletType}`);
  }
};

// ✅ EXPORTAMOS TODO LO NECESARIO PARA EVITAR ERRORES EN OTROS ARCHIVOS
export { WALLET_TYPES, WALLET_NAMES, WALLET_DOWNLOAD_URLS };
