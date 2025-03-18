/**
 * 📂 providers.js - Detecta wallets compatibles con Solana
 * Siguiendo el estándar de Solana sin adaptadores externos.
 */

/**
 * 🔎 Obtiene el proveedor de Solana (si existe en el navegador).
 * @returns {Object|null} El proveedor de Solana o null si no hay wallets instaladas.
 */
export const getSolanaProvider = () => window.solana || null;

/**
 * 🧐 Comprueba si hay una wallet instalada en el navegador.
 * @returns {boolean} True si hay una wallet compatible, false si no.
 */
export const isWalletInstalled = () => !!window.solana;

/**
 * 🏷️ Devuelve qué wallet está siendo utilizada actualmente.
 * @returns {string} El nombre de la wallet ("Phantom", "Backpack", "Magic Eden Wallet", "Desconocida").
 */
export const getWalletType = () => {
  if (window.solana?.isPhantom) return "Phantom";
  if (window.solana?.isBackpack) return "Backpack";
  if (window.solana?.isMagicEden) return "Magic Eden Wallet";
  return "Desconocida";
};
