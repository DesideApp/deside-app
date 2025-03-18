/**
 * 📂 walletStateService.js - Maneja el estado de la wallet conectada, firma mensajes y autentica con el backend.
 */

import { isConnected, connectWallet, disconnectWallet, getPublicKey } from "./walletService";
import { getWalletBalance } from "./walletBalanceService";
import { signMessage, authenticateWallet } from "./authService";

/**
 * 🔍 Detecta si hay una wallet conectada y obtiene su balance.
 * @returns {Promise<{ pubkey: string | null, balance: number | null, status: string }>}
 */
export const detectWallet = async () => {
  if (!isConnected()) return { pubkey: null, balance: null, status: "not_connected" };

  const pubkey = getPublicKey();
  const balance = await getWalletBalance();
  return { pubkey, balance, status: "connected" };
};

/**
 * 🔌 Conectar una wallet, firmar un mensaje y autenticar con el backend.
 * @returns {Promise<{ pubkey: string | null, balance: number | null, status: string }>}
 */
export const handleWalletSelected = async () => {
  try {
    await connectWallet();
    const { pubkey, balance } = await detectWallet();

    // ✍️ Firmar mensaje para autenticación
    const signedData = await signMessage("Please sign this message to authenticate.");
    if (!signedData.signature) return { pubkey, balance, status: "signature_failed" };

    // 🔐 Enviar firma al backend para autenticación
    const authResponse = await authenticateWallet(signedData.pubkey, signedData.signature);
    if (authResponse.status !== "authenticated") return { pubkey, balance, status: "auth_failed" };

    return { pubkey, balance, status: "authenticated" };
  } catch (error) {
    console.error("❌ Error al conectar y autenticar:", error.message);
    return { pubkey: null, balance: null, status: "error" };
  }
};

/**
 * ❌ Cerrar sesión y resetear el estado de la wallet.
 * @returns {Promise<void>}
 */
export const handleLogoutClick = async () => {
  await disconnectWallet();
};
