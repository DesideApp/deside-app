/**
 * 📂 walletStateService.js - Maneja estado y conexión simplificada de wallets
 */

import { connectWallet, disconnectWallet, isConnected, getPublicKey } from './walletService';

// Estado centralizado simple
let walletState = {
  pubkey: null,
};

// Flag logout explícito
let explicitLogout = false;

// Estado para controlar listeners
let listenersInitialized = false;

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
 * 🚨 Inicializar listeners globales (connect, disconnect, accountChanged)
 */
const initializeWalletListeners = () => {
  if (listenersInitialized) return;

  const provider = getProvider();
  if (!provider) return;

  provider.on("connect", (newPublicKey) => {
    console.log(`[WalletStateService] 🟢 Conexión establecida externamente: ${newPublicKey.toString()}`);
    updateWalletState(newPublicKey.toString());
    explicitLogout = false;
  });

  provider.on("disconnect", () => {
    console.warn("[WalletStateService] 🔴 Wallet desconectada externamente.");
    updateWalletState(null);
    explicitLogout = true;
  });

  provider.on("accountChanged", (newPublicKey) => {
    if (newPublicKey) {
      console.log(`[WalletStateService] 🔄 Cambio externo de cuenta detectado: ${newPublicKey.toString()}`);
      updateWalletState(newPublicKey.toString());
    } else {
      console.warn("[WalletStateService] 🔄 Desconexión de cuenta detectada externamente.");
      updateWalletState(null);
    }
  });

  listenersInitialized = true;
};

/**
 * 🔍 Detecta automáticamente wallet (sin popup), respetando logout explícito
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');

  initializeWalletListeners(); // Inicializar listeners aquí

  if (explicitLogout) {
    console.log('[WalletStateService] ⚠️ Logout explícito previo detectado, no reconectando automáticamente.');
    updateWalletState(null);
    return { pubkey: null, status: 'explicit_logout' };
  }

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

    const { pubkey } = await connectWallet({ walletType }); // Popup explícito

    if (!pubkey) {
      console.error('[WalletStateService] ❌ No se pudo conectar manualmente.');
      updateWalletState(null);
      return { pubkey: null, status: 'connection_failed' };
    }

    updateWalletState(pubkey);
    explicitLogout = false; // Resetear logout explícito tras reconexión manual
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
    explicitLogout = true; // Marcar logout explícito
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};
