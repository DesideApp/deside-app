/**
 * 📂 walletStateService.js - Maneja estado, autenticación y multi-wallet
 */

import {
  connect,
  disconnectWallet,
} from './walletService';
import { signMessage, authenticateWallet } from './authService';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NOT_CONNECTED: 'No hay una wallet conectada.',
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  SIGNATURE_FAILED: 'Error al firmar el mensaje.',
  AUTH_FAILED: 'Error al autenticar con el backend.',
};

// Estado centralizado de la wallet
let walletState = {
  pubkey: null,
  balance: null,
};

/**
 * 🔍 Obtiene el estado actual de la wallet
 * @returns {{pubkey: string|null, balance: number|null}}
 */
export const getWalletState = () => {
  return walletState;
};

/**
 * 🔹 Actualiza el estado de la wallet
 * @param {string|null} pubkey - Clave pública de la wallet
 * @param {number|null} balance - Balance de la wallet
 */
const updateWalletState = (pubkey, balance) => {
  walletState = { pubkey, balance };
};

/**
 * 🔍 Detecta automáticamente si hay una wallet conectada (conexión automática)
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const detectWallet = async () => {
  try {
    console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');
    const { pubkey, balance } = await connect({ onlyIfTrusted: true });

    if (pubkey) {
      updateWalletState(pubkey, balance);
      console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey, balance });
      return { pubkey, balance, status: 'connected' };
    }

    console.log('[WalletStateService] ❌ No se detectó ninguna wallet automáticamente.');
    updateWalletState(null, null);
    return { pubkey: null, balance: null, status: 'not_connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet automáticamente:', error.message);
    updateWalletState(null, null);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * 🔌 Conexión completa con wallet específica + autenticación
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @returns {Promise<{pubkey: string|null balance: number|null, status: string}>}
 */
export const handleWalletSelected = async (walletType) => {
  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, balance: null, status: 'invalid_wallet_type' };
  }

  try {
    console.log(`[WalletStateService] 🔍 Intentando conectar con wallet: ${walletType}`);
    await disconnectWallet(); // Desconectar cualquier wallet previa
    const { pubkey, balance } = await connect({ walletType });

    if (!pubkey) {
      console.error('[WalletStateService] ❌ No se pudo conectar a la wallet.');
      return { pubkey: null, balance: null, status: 'connection_failed' };
    }

    const signedData = await signMessage('Please sign this message to authenticate.');
    if (!signedData?.signature) {
      console.error('[WalletStateService] ❌', ERROR_MESSAGES.SIGNATURE_FAILED);
      return { pubkey, balance, status: 'signature_failed' };
    }

    const authResponse = await authenticateWallet(signedData.pubkey, signedData.signature);
    if (!authResponse?.authenticated) {
      console.error('[WalletStateService] ❌', ERROR_MESSAGES.AUTH_FAILED);
      return { pubkey, balance, status: 'auth_failed' };
    }

    updateWalletState(pubkey, balance);
    console.log('[WalletStateService] ✅ Autenticación exitosa');
    return { pubkey, balance, status: 'authenticated' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en flujo completo:', error.message);
    updateWalletState(null, null);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * 🔹 Maneja la selección de una wallet desde el modal
 * @param {string} walletType - Tipo de wallet seleccionada ("phantom", "backpack", "magiceden")
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const selectWallet = async (walletType) => {
  console.log(`[WalletStateService] 🔍 Wallet seleccionada: ${walletType}`);

  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, balance: null, status: 'invalid_wallet_type' };
  }

  // Reutilizamos `handleWalletSelected` para conectar a la wallet
  const result = await handleWalletSelected(walletType);

  if (result.status === 'connected') {
    console.log('[WalletStateService] ✅ Wallet conectada exitosamente:', result);
  } else {
    console.error('[WalletStateService] ❌ Error al conectar la wallet:', result.status);
  }

  return result;
};

/**
 * ❌ Cierre de sesión completo
 * @returns {Promise<void>}
 */
export const handleLogoutClick = async () => {
  try {
    console.log('[WalletStateService] 🔍 Intentando cerrar sesión...');
    await disconnectWallet();
    updateWalletState(null, null);
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};