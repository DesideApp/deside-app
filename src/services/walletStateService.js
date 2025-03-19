/**
 * 📂 walletStateService.js - Maneja estado, autenticación y multi-wallet
 */

import {
  connectWallet,
  disconnectWallet,
  getPublicKey,
  getWalletBalance,
  detectWallet as detectWalletService,
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
 * 🔍 Detecta wallet conectada y balance (incluye conexión automática)
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const detectWallet = async () => {
  try {
    // Intentar detectar wallet automáticamente
    const { pubkey, balance } = await detectWalletService();

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
    // 1. Verificar si la wallet seleccionada es diferente de la actual
    const currentPubkey = getPublicKey();
    if (currentPubkey) {
      console.log('[WalletStateService] 🔍 Wallet actual:', currentPubkey);
      if (walletType === currentPubkey) {
        console.log('[WalletStateService] ⚠️ La wallet seleccionada ya está conectada.');
        return { pubkey: currentPubkey, balance: await getWalletBalance(), status: 'connected' };
      }
      await disconnectWallet();
      console.log('[WalletStateService] 🔒 Wallet previa desconectada');
    }

    // 2. Conectar con wallet específica
    await connectWallet({ walletType });
    console.log(`[WalletStateService] ✅ Conectado a ${walletType}`);

    // 3. Obtener datos básicos
    const { pubkey, balance } = await detectWallet();

    // 4. Firmar mensaje para autenticación
    const signedData = await signMessage('Please sign this message to authenticate.');
    if (!signedData?.signature) {
      console.error('[WalletStateService] ❌', ERROR_MESSAGES.SIGNATURE_FAILED);
      return { pubkey, balance, status: 'signature_failed' };
    }

    // 5. Autenticar con backend
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
    await disconnectWallet();
    console.log('[WalletStateService] 🔒 Sesión cerrada correctamente');
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en logout:', error.message);
  }
};