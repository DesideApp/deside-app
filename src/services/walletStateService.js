/**
 * 📂 walletStateService.js - Maneja estado y conexión simplificada de wallets
 */

import { connectWallet, disconnectWallet, isConnected } from './walletService';

// Estado centralizado simple
let walletState = {
  pubkey: null,
};

/**
 * 🔍 Obtener estado actual
 */
export const getWalletState = () => walletState;

/**
 * 🔹 Actualizar estado global
 */
const updateWalletState = (pubkey) => {
  walletState = { pubkey };
};

/**
 * 🔍 Detecta automáticamente wallet (sin popup)
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');

  try {
    const { pubkey } = await connectWallet({ onlyIfTrusted: true });

    if (pubkey) {
      console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey });
      updateWalletState(pubkey);
      return { pubkey, status: 'connected' };
    } else {
      console.warn('[WalletStateService] ❌ No se pudo detectar automáticamente ninguna wallet.');
      updateWalletState(null);
      return { pubkey: null, status: 'not_connected' };
    }
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet automáticamente:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * 🔌 Conectar manualmente a una wallet específica (popup explícito)
 */
export const handleWalletSelected = async (walletType) => {
  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, status: 'invalid_wallet_type' };
  }

  console.log(`[WalletStateService] 🔍 Intentando conectar manualmente a wallet: ${walletType}`);

  try {
    if (isConnected()) {
      console.log('[WalletStateService] 🔍 Wallet previa detectada, desconectando primero...');
      await disconnectWallet();
    }

    const { pubkey } = await connectWallet({ walletType }); // Sin onlyIfTrusted → popup explícito

    if (!pubkey) {
      console.error('[WalletStateService] ❌ No se pudo conectar manualmente.');
      updateWalletState(null);
      return { pubkey: null, status: 'connection_failed' };
    }

    updateWalletState(pubkey);
    console.log('[WalletStateService] ✅ Wallet conectada manualmente exitosamente:', { pubkey });
    return { pubkey, status: 'connected' };

  } catch (error) {
    console.error('[WalletStateService] ❌ Error en conexión manual:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * ❌ Cerrar sesión manualmente
 */
export const handleLogoutClick = async () => {
  console.log('[WalletStateService] 🔍 Intentando cerrar sesión...');

  try {
    await disconnectWallet();
    updateWalletState(null);
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};
