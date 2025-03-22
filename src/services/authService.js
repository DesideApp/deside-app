/**
 * 📂 authService.js - Autenticación de wallet con el backend
 */

import { signMessageForLogin } from "./walletService";
import { authenticateWithServer } from "./apiService"; // ✅ usamos la función centralizada

/**
 * 🔐 Autentica la wallet con el backend.
 * @returns {Promise<{pubkey: string, status: string}>} Estado de autenticación.
 */
export const authenticateWallet = async () => {
  try {
    const signedData = await signMessageForLogin("Please sign this message to authenticate.");
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    // ✅ Usamos el sistema centralizado de llamadas API
    const result = await authenticateWithServer(signedData.pubkey, signedData.signature, signedData.message);

    if (!result.success) return { pubkey: null, status: "server_error" };

    return { pubkey: signedData.pubkey, status: "authenticated" };
  } catch (error) {
    return { pubkey: null, status: "authentication_failed" };
  }
};
