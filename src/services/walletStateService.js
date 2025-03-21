/**
 * 📂 walletStateService.js - Maneja estado y conexión simplificada de wallets
 */

import {
  connectWallet,
  disconnectWallet,
  isConnected,
  getPublicKey,
} from './walletService';
import { getProvider } from './walletProviders';

let walletState = { pubkey: null };
let explicitLogout = false;
let listenersInitialized = false;

export const getWalletState = () => walletState;

const updateWalletState = (pubkey) => {
  walletState = { pubkey };
};

/**
 * 🧠 Inicializa los listeners para eventos externos
 */
const initializeWalletListeners = () => {
  if (listenersInitialized) return;

  const provider = getProvider();
  if (!provider) return;

  provider.on('connect', (publicKey) => {
    console.log(`[WalletStateService] 🟢 Conexión externa detectada: ${publicKey.toString()}`);
    updateWalletState(publicKey.toString());
    explicitLogout = false;
  });

  provider.on('disconnect', () => {
    console.warn('[WalletStateService] 🔴 Desconexión externa detectada.');
    updateWalletState(null);
    explicitLogout = true;
  });

  provider.on('accountChanged', (publicKey) => {
    if (publicKey) {
      console.log(`[WalletStateService] 🔄 Cuenta cambiada externamente: ${publicKey.toString()}`);
      updateWalletState(publicKey.toString());
    } else {
      console.warn('[WalletStateService] 🔄 Cuenta desconectada externamente.');
      updateWalletState(null);
    }
  });

  listenersInitialized = true;
};

/**
 * 🔍 Detectar automáticamente (sin popup)
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');
  initializeWalletListeners();

  if (explicitLogout) {
    console.log('[WalletStateService] ⚠️ Logout explícito activo, omitiendo autoconexión.');
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
      console.warn('[WalletStateService] ❌ No se detectó conexión automática.');
      updateWalletState(null);
      return { pubkey: null, status: 'not_connected' };
    }
  } catch (error) {
    console.error('[WalletStateService] ❌ Error al detectar wallet automáticamente:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * 🔌 Conexión manual (con popup)
 */
export const handleWalletSelected = async (walletType) => {
  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, status: 'invalid_wallet_type' };
  }

  console.log(`[WalletStateService] 🔍 Conectando a wallet: ${walletType}`);
  initializeWalletListeners();

  try {
    if (isConnected()) {
      console.log('[WalletStateService] 🔍 Desconectando wallet previa...');
      await disconnectWallet();
    }

    const { pubkey } = await connectWallet({ walletType });

    if (!pubkey) {
      console.error('[WalletStateService] ❌ Conexión manual fallida.');
      updateWalletState(null);
      return { pubkey: null, status: 'connection_failed' };
    }

    updateWalletState(pubkey);
    explicitLogout = false;
    console.log('[WalletStateService] ✅ Conexión manual exitosa:', { pubkey });
    return { pubkey, status: 'connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error al conectar manualmente:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * ❌ Cierre de sesión manual
 */
export const handleLogoutClick = async () => {
  console.log('[WalletStateService] 🔍 Cerrando sesión...');
  try {
    await disconnectWallet();
    updateWalletState(null);
    explicitLogout = true;
    console.log('[WalletStateService] 🔒 Logout completado.');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};
