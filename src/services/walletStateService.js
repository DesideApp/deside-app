/**
 * 📂 walletStateService.js - Maneja estado, autenticación y multi-wallet
 */

import {
  connect,
  disconnectWallet,
  getPublicKey,
  getWalletBalance,
} from './walletService';
import { signMessage, authenticateWallet } from './authService';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NOT_CONNECTED: 'No hay una wallet conectada.',
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  SIGNATURE_FAILED: 'Error al firmar el mensaje.',
  AUTH_FAILED: 'Error al autenticar con el backend.',
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
      console.log('[WalletStateService] ✅ Wallet detectada automáticamente:', { pubkey, balance });
      return { pubkey, balance, status: 'connected' };
    }

    console.log('[WalletStateService] ❌ No se detectó ninguna wallet automáticamente.');
    return { pubkey: null, balance: null, status: 'not_connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet automáticamente:', error.message);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * 🔌 Conexión completa con wallet específica + autenticación
 * @param {string} walletType - Tipo de wallet ("phantom", "backpack", "magiceden")
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const handleWalletSelected = async (walletType) => {
  try {
    console.log(`[WalletStateService] 🔍 Intentando conectar con wallet: ${walletType}`);
    await disconnectWallet(); // Desconectar cualquier wallet previa
    const { pubkey, balance } = await connect({ walletType });

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

    console.log('[WalletStateService] ✅ Autenticación exitosa');
    return { pubkey, balance, status: 'authenticated' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en flujo completo:', error.message);
    return { pubkey: null, balance: null, status: 'error' };
  }
};

/**
 * ❌ Cierre de sesión completo
 * @returns {Promise<void>}
 */
export const handleLogoutClick = async () => {
  try {
    console.log('[WalletStateService] 🔍 Intentando cerrar sesión...');
    await disconnectWallet();
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};