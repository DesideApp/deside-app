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

// Propiedades específicas de cada proveedor
const PROVIDER_PROPERTIES = {
  [WALLET_TYPES.PHANTOM]: 'isPhantom',
  [WALLET_TYPES.BACKPACK]: 'isBackpack',
  [WALLET_TYPES.MAGIC_EDEN]: 'isMagicEdenWallet',
};

/**
 * 🔎 Obtiene el proveedor de Solana según el tipo especificado.
 * @param {string} [walletType] - Tipo de wallet ("phantom", "backpack", "magiceden").
 * @returns {Object|null} Proveedor o null.
 */
export const getProvider = (walletType) => {
  if (typeof window === 'undefined') return null; // Verificar entorno

  switch (walletType?.toLowerCase()) {
    case WALLET_TYPES.PHANTOM:
      return window.phantom?.solana || null;
    case WALLET_TYPES.BACKPACK:
      return window.backpack || null;
    case WALLET_TYPES.MAGIC_EDEN:
      return window.magiceden?.solana || null;
    default:
      // Detección automática: Phantom → Backpack → Magic Eden → window.solana
      return (
        window.phantom?.solana ||
        window.backpack ||
        window.magiceden?.solana ||
        window.solana ||
        null
      );
  }
};

/**
 * 🏷️ Identifica el tipo de wallet conectada.
 * @param {Object} [provider] - Proveedor de wallet (opcional).
 * @returns {string} Nombre de la wallet.
 */
export const getWalletType = (provider = getProvider()) => {
  if (!provider) return WALLET_NAMES[WALLET_TYPES.UNKNOWN];

  for (const [type, property] of Object.entries(PROVIDER_PROPERTIES)) {
    if (provider[property]) return WALLET_NAMES[type];
  }

  return WALLET_NAMES[WALLET_TYPES.UNKNOWN];
};

/**
 * 🧐 Verifica si una wallet específica está disponible en el navegador.
 * @param {string} walletType - Tipo de wallet a verificar.
 * @returns {boolean} True si está disponible.
 */
export const isWalletAvailable = (walletType) => {
  return !!getProvider(walletType);
};

// ✅ EXPORTAMOS TODO LO NECESARIO PARA EVITAR ERRORES EN OTROS ARCHIVOS
export { WALLET_TYPES, WALLET_NAMES };
