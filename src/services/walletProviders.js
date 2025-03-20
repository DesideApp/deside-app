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

// Configuración de cada proveedor
const PROVIDERS = {
  [WALLET_TYPES.PHANTOM]: {
    check: () => window.phantom?.solana?.isPhantom,
    get: () => window.phantom?.solana,
    downloadUrl: WALLET_DOWNLOAD_URLS[WALLET_TYPES.PHANTOM],
  },
  [WALLET_TYPES.BACKPACK]: {
    check: () => window.backpack?.isBackpack,
    get: () => window.backpack,
    downloadUrl: WALLET_DOWNLOAD_URLS[WALLET_TYPES.BACKPACK],
  },
  [WALLET_TYPES.MAGIC_EDEN]: {
    check: () => window.magicEden?.solana?.isMagicEdenWallet,
    get: () => window.magicEden?.solana,
    downloadUrl: WALLET_DOWNLOAD_URLS[WALLET_TYPES.MAGIC_EDEN],
  },
};

/**
 * 🔎 Obtiene el proveedor de Solana según el tipo especificado.
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden").
 * @returns {Object|null} Proveedor o null.
 */
export const getProvider = (walletType) => {
  console.log(`[WalletProviders] 🔍 Intentando obtener proveedor para: ${walletType}`);

  // Validar que el walletType sea válido
  if (!walletType || !Object.values(WALLET_TYPES).includes(walletType)) {
    console.warn(`[WalletProviders] ⚠️ Tipo de wallet desconocido o no válido: ${walletType}`);
    return null;
  }

  const providerConfig = PROVIDERS[walletType];
  if (!providerConfig) {
    console.warn(`[WalletProviders] ⚠️ No se encontró configuración para el tipo de wallet: ${walletType}`);
    return null;
  }

  // Verificar si el proveedor está disponible
  if (providerConfig.check()) {
    console.log(`[WalletProviders] ✅ ${walletType} detectado.`);
    return providerConfig.get();
  }

  // Si no está disponible, redirigir a la descarga
  console.warn(`[WalletProviders] ❌ ${walletType} no detectado. Redirigiendo a la descarga...`);
  redirectToWalletDownload(walletType);
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
