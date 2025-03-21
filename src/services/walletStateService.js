/**
 * 📂 walletStateService.js - Maneja estado y conexión simplificada de wallets
 */

import { connectWallet, disconnectWallet, isConnected } from './walletService';
import { getProvider } from './walletProviders';

// Estado global centralizado
let walletState = {
  pubkey: null,
};

// Flag de logout explícito
let explicitLogout = false;

// Flag para listeners
let listenersInitialized = false;

// Subscriptores externos
let subscribers = [];

/**
 * 🧠 Subscripción reactiva al estado de la wallet
 * @param {function} callback - Se ejecuta cada vez que cambia el estado
 */
export const subscribeWalletState = (callback) => {
  subscribers.push(callback);
};

/**
 * 🔁 Notificar a todos los subscriptores del nuevo estado
 */
const notifySubscribers = () => {
  for (const cb of subscribers) cb(walletState);
};

/**
 * 🔍 Obtener el estado actual
 */
export const getWalletState = () => walletState;

/**
 * ✅ Actualizar estado
 */
const updateWalletState = (pubkey) => {
  walletState = { pubkey };
  notifySubscribers();
};

/**
 * 🧷 Inicializa los listeners (connect, disconnect, accountChanged)
 */
const initializeWalletListeners = () => {
  if (listenersInitialized) return;

  const provider = getProvider();
  if (!provider) return;

  provider.on("connect", (newPublicKey) => {
    console.log(`[WalletStateService] 🟢 Conectado externamente: ${newPublicKey.toString()}`);
    updateWalletState(newPublicKey.toString());
    explicitLogout = false;
  });

  provider.on("disconnect", () => {
    console.warn("[WalletStateService] 🔴 Desconectado externamente.");
    updateWalletState(null);
    explicitLogout = true;
  });

  provider.on("accountChanged", (newPublicKey) => {
    if (newPublicKey) {
      console.log(`[WalletStateService] 🔄 Cuenta cambiada: ${newPublicKey.toString()}`);
      updateWalletState(newPublicKey.toString());
    } else {
      console.warn("[WalletStateService] 🔄 Cuenta desconectada.");
      updateWalletState(null);
    }
  });

  listenersInitialized = true;
};

/**
 * 🔍 Detecta automáticamente wallet (si no hubo logout explícito)
 */
export const detectWallet = async () => {
  console.log('[WalletStateService] 🔍 Intentando detectar wallet automáticamente...');

  initializeWalletListeners();

  if (explicitLogout) {
    console.log('[WalletStateService] ⚠️ Logout explícito → no reconectar automáticamente.');
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
      updateWalletState(null);
      return { pubkey: null, status: 'not_connected' };
    }
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * 🔌 Conectar manualmente a wallet específica
 */
export const handleWalletSelected = async (walletType) => {
  if (!walletType) {
    console.error('[WalletStateService] ❌ Tipo de wallet no definido.');
    return { pubkey: null, status: 'invalid_wallet_type' };
  }

  console.log(`[WalletStateService] 🔍 Conectando manualmente con: ${walletType}`);

  try {
    if (isConnected()) {
      console.log('[WalletStateService] 🔁 Wallet previa detectada, desconectando...');
      await disconnectWallet();
    }

    const { pubkey } = await connectWallet({ walletType });

    if (!pubkey) {
      updateWalletState(null);
      return { pubkey: null, status: 'connection_failed' };
    }

    updateWalletState(pubkey);
    explicitLogout = false;
    console.log('[WalletStateService] ✅ Conectado manualmente:', { pubkey });
    return { pubkey, status: 'connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en conexión manual:', error.message);
    updateWalletState(null);
    return { pubkey: null, status: 'error' };
  }
};

/**
 * ❌ Cerrar sesión manual
 */
export const handleLogoutClick = async () => {
  console.log('[WalletStateService] 🔍 Cerrar sesión manualmente...');
  try {
    await disconnectWallet();
    updateWalletState(null);
    explicitLogout = true;
    console.log('[WalletStateService] 🔒 Logout completo.');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};
