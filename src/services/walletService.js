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

// Flag de logout explícito
let explicitLogout = false;

/**
 * 🔌 Conecta a una wallet (manual o automática silenciosa)
 */
export const connectWallet = async ({ walletType, onlyIfTrusted = false } = {}) => {
  const provider = getProvider(walletType);

  if (!provider) {
    const errorMsg = ERROR_MESSAGES.NOT_INSTALLED(walletType);
    console.error(`[WalletService] ❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 🚫 Bloqueo de reconexión automática si el usuario hizo logout manual
  if (explicitLogout && onlyIfTrusted) {
    console.log("[WalletService] 🚫 No se intentará reconectar automáticamente (logout explícito).");
    return { pubkey: null };
  }

  try {
    await provider.connect({ onlyIfTrusted });

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
 */
export const isConnected = () => {
  const provider = getProvider();
  return provider?.isConnected || false;
};

/**
 * 🔍 Obtiene la clave pública de la wallet conectada
 */
export const getPublicKey = () => {
  const provider = getProvider();
  return provider?.publicKey?.toString() || null;
};

/**
 * 📛 Marca que el usuario cerró sesión manualmente
 */
export const markExplicitLogout = () => {
  explicitLogout = true;
};

/**
 * 🧼 Limpia el estado de logout explícito (tras reconexión manual)
 */
export const clearExplicitLogout = () => {
  explicitLogout = false;
};
