/**
 * 📂 walletService.js - Maneja conexión, desconexión y balance de wallets
 */

import { getProvider, getWalletType } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NO_PROVIDER: 'No se detectó ninguna wallet compatible.',
  NOT_INSTALLED: (walletType) => `${walletType ? walletType : 'Unknown Wallet'} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
};

/**
 * 🔌 Conecta a una wallet (manual o automática)
 * @param {Object} [options] - Opciones de conexión
 * @param {string} [options.walletType] - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @param {boolean} [options.onlyIfTrusted] - Si es true, intenta una conexión automática
 * @returns {Promise<{pubkey: string|null}>} Clave pública
 */
export const connectWallet = async ({ walletType, onlyIfTrusted = false } = {}) => {
  console.log(`[WalletService] 🔍 Intentando conectar con wallet: ${walletType || 'automática'}`);
  const provider = getProvider(walletType);

  if (!provider) {
    console.error(`[WalletService] ❌ No se detectó el proveedor para ${walletType || 'automática'}.`);
    throw new Error(ERROR_MESSAGES.NOT_INSTALLED(walletType || 'desconocida'));
  }

  try {
    if (onlyIfTrusted) {
      await provider.connect({ onlyIfTrusted: true });
      if (!provider.publicKey) {
        console.warn("⚠️ Conexión automática fallida, intentando manualmente...");
        await provider.connect();
      }
    } else {
      await provider.connect();
    }

    if (!provider.publicKey) {
      throw new Error("La conexión fue exitosa pero no se obtuvo una publicKey.");
    }

    // Manejar eventos de desconexión automática
    provider.on("disconnect", () => console.warn("[WalletService] 🔴 Wallet desconectada inesperadamente."));

    console.log(`[WalletService] ✅ Conectado a ${getWalletType(provider)} (${provider.publicKey.toString()})`);
    return { pubkey: provider.publicKey.toString() };
  } catch (error) {
    console.error(`[WalletService] ❌ Error al conectar: ${error.message}`);
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
