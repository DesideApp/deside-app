/**
 * 📂 walletService.js - Maneja conexión, desconexión y balance de wallets
 */

import { getProvider, getWalletType, WALLET_NAMES } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NO_PROVIDER: 'No se detectó ninguna wallet compatible.',
  NOT_INSTALLED: (walletType) => `${WALLET_NAMES[walletType]} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
  BALANCE_FAILED: 'Error al obtener el balance de la wallet.',
};

/**
 * 🔌 Conecta a una wallet (manual o automática)
 * @param {Object} [options] - Opciones de conexión
 * @param {string} [options.walletType] - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @param {boolean} [options.onlyIfTrusted] - Si es true, intenta una conexión automática
 * @returns {Promise<{pubkey: string|null, balance: number|null}>} Clave pública y balance
 */
export const connect = async ({ walletType, onlyIfTrusted = false } = {}) => {
  console.log(`[WalletService] 🔍 Intentando conectar con wallet: ${walletType || 'automática'}`);
  const provider = getProvider(walletType);

  if (!provider) {
    console.error(`[WalletService] ❌ No se detectó el proveedor para ${walletType || 'automática'}.`);
    throw new Error(ERROR_MESSAGES.NOT_INSTALLED(walletType || 'desconocida'));
  }

  if (typeof provider.connect !== 'function') {
    throw new Error(`[WalletService] ❌ El proveedor no soporta el método "connect".`);
  }

  try {
    // Intentar conectar (manual o automática)
    await provider.connect({ onlyIfTrusted });
    const pubkey = provider.publicKey?.toString();
    const balance = pubkey ? await getWalletBalance() : null;

    console.log(`[WalletService] ✅ Conectado a ${getWalletType(provider)} (${pubkey}), Balance: ${balance} SOL`);
    return { pubkey, balance };
  } catch (error) {
    if (onlyIfTrusted) {
      console.warn(`[WalletService] ⚠️ Conexión automática fallida: ${error.message}`);
      return { pubkey: null, balance: null };
    }
    console.error(`[WalletService] ❌ Error al conectar manualmente: ${error.message}`);
    throw new Error(`${ERROR_MESSAGES.CONNECTION_FAILED} ${error.message}`);
  }
};

/**
 * ❌ Desconecta la wallet activa
 * @returns {Promise<void>}
 */
export const disconnectWallet = async () => {
  console.log('[WalletService] 🔍 Intentando desconectar wallet...');
  const provider = getProvider();

  if (!provider) {
    console.log("[WalletService] ⚠️ No había una wallet conectada.");
    return;
  }

  if (typeof provider.disconnect !== 'function') {
    throw new Error(`[WalletService] ❌ El proveedor no soporta el método "disconnect".`);
  }

  try {
    await provider.disconnect();
    console.log('[WalletService] 🔒 Sesión desconectada');
  } catch (error) {
    console.error(`[WalletService] ❌ Error al desconectar: ${error.message}`);
    throw new Error(`${ERROR_MESSAGES.DISCONNECTION_FAILED} ${error.message}`);
  }
};

/**
 * ✅ Verifica si hay una wallet conectada
 * @returns {boolean} True si la wallet está conectada
 */
export const isConnected = () => {
  const provider = getProvider();
  return !!provider?.publicKey;
};

/**
 * 🔍 Obtiene la clave pública de la wallet conectada
 * @returns {string|null} PublicKey en formato string o null si no hay conexión
 */
export const getPublicKey = () => {
  const provider = getProvider();
  return provider?.publicKey?.toString() || null;
};

/**
 * 💰 Obtiene el balance de la wallet conectada desde el proveedor
 * @returns {Promise<number>} Balance en SOL (0 si falla)
 */
export const getWalletBalance = async () => {
  console.log('[WalletService] 🔍 Intentando obtener balance...');
  const provider = getProvider();

  if (!provider) {
    console.error("[WalletService] ❌ No se detectó ningún proveedor.");
    return 0;
  }

  if (!provider.publicKey) {
    console.error("[WalletService] ❌ No hay una wallet conectada.");
    return 0;
  }

  try {
    // Verificar si el proveedor tiene un método para obtener el balance
    if (typeof provider.getBalance === "function") {
      const balanceLamports = await provider.getBalance(provider.publicKey);
      return parseFloat((balanceLamports / 1e9).toFixed(4)); // Convertir a SOL
    }

    console.warn("[WalletService] ⚠️ El proveedor no soporta 'getBalance'.");
    return 0;
  } catch (error) {
    console.error(`[WalletService] ❌ Error al obtener balance: ${error.message}`);
    return 0;
  }
};
