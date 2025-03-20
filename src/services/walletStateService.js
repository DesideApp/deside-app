/**
 * 📂 walletStateService.js - Maneja estado y conexión de wallets
 */

import { connectWallet, disconnectWallet, isConnected } from './walletService';

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
 * 🔍 Detecta automáticamente si hay una wallet conectada (intenta conexión automática primero y popup si necesario)
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');

  const walletTypes = ['phantom', 'backpack', 'magiceden'];

  for (const walletType of walletTypes) {
    const { pubkey } = await handleWalletSelected(walletType);

    if (pubkey) {
      console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey });
      return { pubkey, balance: null, status: 'connected' };
    }
  }

  console.warn('[WalletStateService] ❌ No se pudo detectar automáticamente ninguna wallet.');
  updateWalletState(null, null);
  return { pubkey: null, balance: null, status: 'not_connected' };
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

    const { pubkey } = await connectWallet({ walletType, onlyIfTrusted: true });

    if (!pubkey) {
      console.warn('[WalletStateService] ⚠️ Conexión automática fallida, abriendo popup manualmente...');
      const manualConnection = await connectWallet({ walletType });
      
      if (!manualConnection.pubkey) {
        console.error('[WalletStateService] ❌ No se pudo conectar manualmente.');
        updateWalletState(null, null);
        return { pubkey: null, balance: null, status: 'connection_failed' };
      }

      updateWalletState(manualConnection.pubkey, null);
      console.log('[WalletStateService] ✅ Wallet conectada manualmente exitosamente:', { pubkey: manualConnection.pubkey });
      return { pubkey: manualConnection.pubkey, balance: null, status: 'connected' };
    }

    updateWalletState(pubkey, null);
    console.log('[WalletStateService] ✅ Wallet conectada automáticamente exitosamente:', { pubkey });
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
