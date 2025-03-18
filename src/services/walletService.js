/**
 * 📂 walletService.js - Maneja conexión y desconexión de wallets en Solana.
 */

import { getSolanaProvider } from "./providers";

/**
 * 🔌 Conecta con la wallet y obtiene la `publicKey`.
 * @returns {Promise<string>} La `publicKey` en formato string.
 * @throws {Error} Si la conexión falla o el usuario la rechaza.
 */
export const connectWallet = async () => {
  const provider = getSolanaProvider();
  if (!provider) throw new Error("No se detectó una wallet compatible.");

  try {
    await provider.connect();
    return provider.publicKey.toString();
  } catch (error) {
    throw new Error(`Error al conectar la wallet: ${error.message}`);
  }
};

/**
 * ❌ Desconecta la wallet y limpia el estado.
 */
export const disconnectWallet = async () => {
  const provider = getSolanaProvider();
  if (provider) {
    await provider.disconnect();
  }
};

/**
 * ✅ Verifica si hay una wallet conectada.
 * @returns {boolean} `true` si la wallet está conectada, `false` si no.
 */
export const isConnected = () => {
  const provider = getSolanaProvider();
  return provider?.isConnected || false;
};

/**
 * 🔎 Obtiene la `publicKey` de la wallet conectada.
 * @returns {string|null} La `publicKey` en formato string o `null` si no hay conexión.
 */
export const getPublicKey = () => {
  const provider = getSolanaProvider();
  return provider?.publicKey?.toString() || null;
};
