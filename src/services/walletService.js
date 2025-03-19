/**
 * 📂 walletService.js - Maneja conexión, desconexión y balance de wallets
 */

import { getProvider, getWalletType, WALLET_TYPES, WALLET_NAMES } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NO_PROVIDER: 'No se detectó ninguna wallet compatible.',
  NOT_INSTALLED: (walletType) => `${WALLET_NAMES[walletType]} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
  BALANCE_FAILED: 'Error al obtener el balance de la wallet.',
};

/**
 * 🔌 Conecta a una wallet específica o detecta automáticamente
 * @param {Object} [options] - Opciones de conexión
 * @param {string} [options.walletType] - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @param {boolean} [options.onlyIfTrusted] - Conexión automática sin popup
 * @returns {Promise<string>} PublicKey en formato string
 */
export const connectWallet = async ({ walletType, onlyIfTrusted = false } = {}) => {
  const provider = walletType ? getProvider(walletType) : getProvider();

  if (!provider) {
    throw new Error(
      walletType
        ? ERROR_MESSAGES.NOT_INSTALLED(walletType)
        : ERROR_MESSAGES.NO_PROVIDER
    );
  }

  if (typeof provider.connect !== 'function') {
    throw new Error(`[WalletService] ❌ El proveedor no soporta el método "connect".`);
  }

  try {
    // Si la wallet ya está conectada, evitamos reconectar innecesariamente
    if (provider.isConnected && provider.publicKey) {
      console.log(`[WalletService] ✅ Ya conectado a ${getWalletType(provider)} (${provider.publicKey.toString()})`);
      return provider.publicKey.toString();
    }

    // Establecer conexión con o sin popup
    await provider.connect(onlyIfTrusted ? { onlyIfTrusted: true } : {});

    console.log(`[WalletService] ✅ Conectado a ${getWalletType(provider)}`);
    return provider.publicKey.toString();
  } catch (error) {
    console.error(`[WalletService] ❌ Error en ${getWalletType(provider)}: ${error.message}`);
    throw new Error(`${ERROR_MESSAGES.CONNECTION_FAILED} ${error.message}`);
  }
};

/**
 * ❌ Desconecta la wallet activa
 * @returns {Promise<void>}
 */
export const disconnectWallet = async () => {
  const provider = getProvider();

  if (!provider) {
    console.log("[WalletService] ⚠️ No había una wallet conectada.");
    return;
  }

  if (typeof provider.disconnect !== 'function') {
    throw new Error(`[WalletService] ❌ El proveedor no soporta el método "disconnect".`);
  }

  if (provider.isConnected) {
    try {
      await provider.disconnect();
      console.log('[WalletService] 🔒 Sesión desconectada');
    } catch (error) {
      console.error(`[WalletService] ❌ Error al desconectar: ${error.message}`);
      throw new Error(`${ERROR_MESSAGES.DISCONNECTION_FAILED} ${error.message}`);
    }
  } else {
    console.log("[WalletService] ⚠️ No había una wallet conectada.");
  }
};

/**
 * ✅ Verifica si hay una wallet conectada
 * @returns {boolean} True si la wallet está conectada
 */
export const isConnected = () => {
  const provider = getProvider();
  return provider?.isConnected || false;
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
