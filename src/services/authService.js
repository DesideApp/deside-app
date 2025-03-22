/**
 * 📂 authService.js - Autenticación de wallet con el backend
 */

import { signMessageForLogin } from "./walletService"; // usamos la firma desde walletService

/**
 * 🔐 Autentica la wallet con el backend.
 * @returns {Promise<{pubkey: string, status: string}>} Estado de autenticación.
 */
export const authenticateWallet = async () => {
  try {
    const signedData = await signMessageForLogin("Please sign this message to authenticate.");
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    // 🚀 Llamamos al backend para validar la firma
    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signedData),
    });

    const result = await response.json();
    if (!result.success) return { pubkey: null, status: "server_error" };

    return { pubkey: signedData.pubkey, status: "authenticated" };
  } catch (error) {
    return { pubkey: null, status: "authentication_failed" };
  }
};
