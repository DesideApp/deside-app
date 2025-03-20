/**
 * 📂 walletStateService.js - Maneja estado y conexión de wallets
 */

import { connectWallet, disconnectWallet, isConnected, getPublicKey } from './walletService';

// Estado centralizado de la wallet
let walletState = {
  pubkey: null,
  balance: null,
};

/**
 * 🔍 Obtiene el estado actual de la wallet
 * @returns {{pubkey: string|null, balance: number|null}}
 */
export const getWalletState = () => walletState;

/**
 * 🔹 Actualiza el estado de la wallet
 * @param {string|null} pubkey - Clave pública de la wallet
 * @param {number|null} balance - Balance de la wallet
 */
const updateWalletState = (pubkey, balance) => {
  walletState = { pubkey, balance };
};

/**
 * 🔍 Detecta automáticamente si hay una wallet conectada (conexión automática real)
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');

  try {
    const { pubkey } = await connectWallet({ onlyIfTrusted: true });

    if (!pubkey) {
      console.warn('[WalletStateService] ❌ No se detectó ninguna wallet automáticamente.');
      updateWalletState(null, null);
      return { pubkey: null, balance: null, status: 'not_connected' };
    }

    console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey });
    updateWalletState(pubkey, null);
    return { pubkey, balance: null, status: 'connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet automáticamente:', error.message);
    updateWalletState(null, null);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * 🔌 Conectar manualmente a una wallet específica
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const handleWalletSelected = async (walletType) => {
  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, balance: null, status: 'invalid_wallet_type' };
  }

  console.log(`[WalletStateService] 🔍 Intentando conectar con wallet: ${walletType}`);

  try {
    if (isConnected()) {
      console.log('[WalletStateService] 🔍 Wallet previa detectada, desconectando primero...');
      await disconnectWallet();
    }

    const { pubkey } = await connectWallet({ walletType });

    if (!pubkey) {
      console.error('[WalletStateService] ❌ No se pudo conectar a la wallet.');
      updateWalletState(null, null);
      return { pubkey: null, balance: null, status: 'connection_failed' };
    }

    console.log('[WalletStateService] ✅ Wallet conectada exitosamente:', { pubkey });
    updateWalletState(pubkey, null);
    return { pubkey, balance: null, status: 'connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en conexión manual:', error.message);
    updateWalletState(null, null);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * ❌ Cierre de sesión completo
 * @returns {Promise<void>}
 */
export const handleLogoutClick = async () => {
  console.log('[WalletStateService] 🔍 Intentando cerrar sesión...');

  try {
    await disconnectWallet();
    updateWalletState(null, null);
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};
