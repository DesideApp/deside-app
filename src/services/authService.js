/**
 * 📂 authService.js - Maneja autenticación y firma de mensajes en Solana.
 */

import { getProvider } from "./walletProviders";
import bs58 from "bs58"; // Solo necesario si el backend lo requiere

/**
 * ✍️ Firma un mensaje con la wallet conectada.
 * @param {string} message - Mensaje a firmar.
 * @returns {Promise<{signature: string, pubkey: string}>} Firma en `bs58` + `publicKey`.
 * @throws {Error} Si la firma falla o el usuario la rechaza.
 */
export const signMessage = async (message) => {
  const provider = getProvider();
  if (!provider) throw new Error("No hay wallet conectada.");

  try {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage, "utf8");

    return {
      signature: bs58.encode(signedMessage), // ⚠️ Convertimos a `bs58` si el backend lo requiere
      pubkey: provider.publicKey.toString(),
    };
  } catch (error) {
    throw new Error(`Error al firmar el mensaje: ${error.message}`);
  }
};

/**
 * 🔐 Autentica la wallet con el backend.
 * @returns {Promise<{pubkey: string, status: string}>} Estado de autenticación.
 */
export const authenticateWallet = async () => {
  try {
    const provider = getProvider();
    if (!provider || !provider.isConnected) {
      return { pubkey: null, status: "not_connected" };
    }

    const signedData = await signMessage("Please sign this message to authenticate.");
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
