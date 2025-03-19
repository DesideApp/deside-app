/**
 * 📂 walletStateService.js - Maneja estado, autenticación y multi-wallet
 */

import { isConnected, connectWallet, disconnectWallet, getPublicKey } from './walletService';
import { getWalletBalance } from './walletBalanceService';
import { signMessage, authenticateWallet } from './authService';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NOT_CONNECTED: 'No hay una wallet conectada.',
  CONNECTION_FAILED: 'Error al conectar la wallet.',
  SIGNATURE_FAILED: 'Error al firmar el mensaje.',
  AUTH_FAILED: 'Error al autenticar con el backend.',
};

/**
 * 🔍 Detecta wallet conectada y balance
 * @returns {Promise<{pubkey: string|null, balance: number|null, status: string}>}
 */
export const detectWallet = async () => {
  if (!isConnected()) {
    console.log('[WalletStateService] ❌', ERROR_MESSAGES.NOT_CONNECTED);
    return { pubkey: null, balance: null, status: 'not_connected' };
  }

  try {
    const pubkey = getPublicKey();
    const balance = await getWalletBalance();
    console.log('[WalletStateService] ✅ Wallet detectada:', { pubkey, balance });
    return { pubkey, balance, status: 'connected' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error detectando wallet:', error.message);
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
    // 1. Desconectar wallet previa si existe
    if (isConnected()) {
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
      await disconnectWallet();
      return { pubkey: null, balance: null, status: 'signature_failed' };
    }

    // 5. Autenticar con backend
    const authResponse = await authenticateWallet(signedData.pubkey, signedData.signature);
    if (!authResponse?.authenticated) {
      console.error('[WalletStateService] ❌', ERROR_MESSAGES.AUTH_FAILED);
      await disconnectWallet();
      return { pubkey: null, balance: null, status: 'auth_failed' };
    }

    console.log('[WalletStateService] ✅ Autenticación exitosa');
    return { pubkey, balance, status: 'authenticated' };
  } catch (error) {
    console.error('[WalletStateService] ❌ Error en flujo completo:', error.message);
    await disconnectWallet();
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