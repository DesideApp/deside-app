/**
 * 📂 walletService.js - Maneja conexión, desconexión y clave pública
 */

import { getProvider, getWalletType } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NOT_INSTALLED: (walletType) => `${walletType || 'Unknown Wallet'} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
};

// Estado para controlar que no se agreguen múltiples listeners
let listenersInitialized = false;

/**
 * 🔌 Conecta a una wallet (manual o automática silenciosa)
 * @param {Object} [options] Opciones de conexión
 * @param {string} [options.walletType] Tipo de wallet ("phantom", "backpack", "magiceden")
 * @param {boolean} [options.onlyIfTrusted] Si es true, conexión automática silenciosa
 * @returns {Promise<{pubkey: string|null}>} Objeto con PublicKey
 */
export const connectWallet = async ({ walletType, onlyIfTrusted = false } = {}) => {
  const provider = getProvider(walletType);

  if (!provider) {
    const errorMsg = ERROR_MESSAGES.NOT_INSTALLED(walletType);
    console.error(`[WalletService] ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    await provider.connect({ onlyIfTrusted });

    if (!provider.publicKey) {
      if (onlyIfTrusted) {
        // Silencioso, sin errores ni logs
        return { pubkey: null };
      } else {
        throw new Error("PublicKey no disponible tras conexión.");
      }
    }

    if (!listenersInitialized) {
      provider.on("disconnect", () => {
        console.warn("[WalletService] 🔴 Wallet desconectada inesperadamente.");
      });

      provider.on("accountChanged", (newPublicKey) => {
        console.log(`[WalletService] 🔄 Cambio de cuenta detectado: ${newPublicKey ? newPublicKey.toString() : 'Ninguna cuenta activa'}`);
      });

      listenersInitialized = true;
    }

    console.log(`[WalletService] ✅ Conectado a ${getWalletType(provider)} (${provider.publicKey.toString()})`);

    return { pubkey: provider.publicKey.toString() };

  } catch (error) {
    if (onlyIfTrusted) {
      // Fallo silencioso en conexión automática, no devuelve errores
      return { pubkey: null };
    }

    if (error.code === 4001) {
      console.warn("[WalletService] ⚠️ Conexión rechazada por el usuario.");
    } else {
      console.error(`[WalletService] ❌ Error al conectar: ${error.message}`);
    }

    throw new Error(`${ERROR_MESSAGES.CONNECTION_FAILED} ${error.message}`);
  }
};

/**
 * ❌ Desconecta la wallet activa
 * @returns {Promise<void>}
 */
export const disconnectWallet = async () => {
  const provider = getProvider();

  if (!provider?.isConnected) {
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
 * @returns {boolean}
 */
export const isConnected = () => {
  const provider = getProvider();
  return provider?.isConnected || false;
};

/**
 * 🔍 Obtiene la clave pública de la wallet conectada
 * @returns {string|null}
 */
export const getPublicKey = () => {
  const provider = getProvider();
  return provider?.publicKey?.toString() || null;
};
