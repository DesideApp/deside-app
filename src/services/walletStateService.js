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
    
    const providerConnected = isConnected();
    if (!providerConnected) {
      console.warn('[WalletStateService] ❌ No hay wallet conectada.');
      updateWalletState(null, null);
      return { pubkey: null, balance: null, status: 'not_connected' };
    }

    const pubkey = getPublicKey();
    if (!pubkey) {
      console.warn('[WalletStateService] ❌ La wallet no proporcionó una clave pública.');
      updateWalletState(null, null);
      return { pubkey: null, balance: null, status: 'not_connected' };
    }

    updateWalletState(pubkey, null);
    console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey });
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

    const { pubkey } = await connectWallet({ walletType });

    if (!pubkey) {
      console.error('[WalletStateService] ❌ No se pudo conectar a la wallet.');
      return { pubkey: null, balance: null, status: 'connection_failed' };
    }

    updateWalletState(pubkey, null);
    console.log('[WalletStateService] ✅ Wallet conectada exitosamente:', { pubkey });
    return { pubkey, balance: null, status: 'connected' };

  } catch (error) {
    console.error('[WalletStateService] ❌ Error en conexión manual:', error.message);
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
