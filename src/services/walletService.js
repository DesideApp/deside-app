/**
 * 📂 walletService.js - Maneja conexión, desconexión y clave pública
 */

import { getProvider, getWalletType } from './walletProviders';
import bs58 from "bs58"; // Añadir al principio si no está ya

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NOT_INSTALLED: (walletType) => `${walletType || 'Unknown Wallet'} no detectada. ¡Instálala primero!`,
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  DISCONNECTION_FAILED: 'Error al desconectar la wallet.',
};

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
    if (onlyIfTrusted) {
      await provider.request({ method: "connect", params: { onlyIfTrusted: true } });
    } else {
      await provider.connect();
    }

    if (!provider.publicKey) {
      if (onlyIfTrusted) return { pubkey: null };
      throw new Error("PublicKey no disponible tras conexión.");
    }

    console.log(`[WalletService] ✅ Conectado a ${getWalletType(provider)} (${provider.publicKey.toString()})`);
    return { pubkey: provider.publicKey.toString() };

  } catch (error) {
    if (onlyIfTrusted) return { pubkey: null };

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

// 🔒 Gestión de logout explícito
let explicitLogout = false;

export const markExplicitLogout = () => {
  explicitLogout = true;
};

export const clearExplicitLogout = () => {
  explicitLogout = false;
};

export const isExplicitLogout = () => explicitLogout;

/**
 * ✍️ Firma un mensaje de login con la wallet conectada.
 * @param {string} message - Mensaje a firmar
 * @returns {Promise<{signature: string, pubkey: string, message: string}>}
 */
export const signMessageForLogin = async (message) => {
  const provider = getProvider();
  if (!provider?.signMessage) {
    throw new Error("El proveedor no permite firmar mensajes.");
  }

  try {
    const encodedMessage = new TextEncoder().encode(message);
    console.log("[WalletService] ✉️ Mensaje codificado para firmar:", message);

    const signedMessage = await provider.signMessage(encodedMessage, "utf8");

    const result = {
      pubkey: provider.publicKey.toString(),
      signature: bs58.encode(signedMessage),
      message,
    };

    console.log("[WalletService] ✍️ Firma generada:", result.signature);
    console.log("[WalletService] 📤 Datos listos para backend:", result);

    return result;
  } catch (error) {
    console.error("[WalletService] ❌ Error al firmar mensaje:", error.message);
    throw new Error(`Error al firmar el mensaje: ${error.message}`);
  }
};