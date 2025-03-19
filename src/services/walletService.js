/**
 * 📂 walletService.js - Maneja conexión y desconexión de wallets
 */

import { getProvider, getWalletType, WALLET_TYPES, WALLET_NAMES } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NO_PROVIDER: 'No se detectó ninguna wallet compatible.',
  NOT_INSTALLED: (walletType) => `${WALLET_NAMES[walletType]} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
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

  if (provider?.isConnected) {
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
