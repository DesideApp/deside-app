/**
 * 📂 walletBalanceService.js - Maneja la obtención del balance desde el provider
 */

import { getProvider } from './walletProviders';

// Mensajes de error comunes
const ERROR_MESSAGES = {
  NO_PROVIDER: 'No se detectó ninguna wallet compatible.',
  NOT_CONNECTED: 'La wallet no está conectada.',
  BALANCE_NOT_AVAILABLE: 'El balance no está disponible.',
};

/**
 * 💰 Obtiene el balance de la wallet conectada en SOL
 * @returns {Promise<number>} Balance en SOL (0 si falla)
 */
export const getWalletBalance = async () => {
  const provider = getProvider();

  if (!provider) {
    console.error('[WalletBalanceService] ❌', ERROR_MESSAGES.NO_PROVIDER);
    return 0;
  }

  if (!provider.isConnected) {
    console.error('[WalletBalanceService] ❌', ERROR_MESSAGES.NOT_CONNECTED);
    return 0;
  }

  try {
    // Obtener el balance en lamports desde el provider
    const balanceLamports = await provider.getBalance();

    // Convertir a SOL
    const balanceSOL = balanceLamports / 1e9;
    console.log('[WalletBalanceService] ✅ Balance obtenido:', balanceSOL);

    return balanceSOL;
  } catch (error) {
    console.error('[WalletBalanceService] ❌', ERROR_MESSAGES.BALANCE_NOT_AVAILABLE, error);
    return 0;
  }
};