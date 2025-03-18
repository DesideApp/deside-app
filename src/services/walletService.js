/**
 * 📂 walletService.js - Maneja conexión y desconexión de wallets en Solana.
 */

import { getSolanaProvider } from "./walletProviders";

/**
 * 🔌 Conecta con la wallet y obtiene la `publicKey`.
 * @param {Object} options - Opciones de conexión.
 * @param {boolean} options.onlyIfTrusted - Si solo debe conectar si es una wallet confiable.
 * @returns {Promise<string>} La `publicKey` en formato string.
 * @throws {Error} Si la conexión falla o el usuario la rechaza.
 */
export const connectWallet = async ({ onlyIfTrusted = false } = {}) => {
  const provider = getSolanaProvider();
  if (!provider) throw new Error("No se detectó una wallet compatible.");

  const walletType = getWalletType(); // Obtenemos el tipo de wallet (Phantom, Backpack, Magic Eden)

  try {
    // Intentar conectar automáticamente si la wallet es confiable
    if (onlyIfTrusted) {
      await provider.connect({ onlyIfTrusted: true }); // Conexión automática para wallets confiables (Phantom y Backpack)
    } else {
      await provider.connect(); // Conexión normal si no es confiable (con popup)
    }

    console.log(`Conectado a ${walletType}`); // Información sobre qué wallet se conectó

    return provider.publicKey.toString(); // Retorna la publicKey
  } catch (error) {
    console.error(`Error al conectar con ${walletType}: ${error.message}`);
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

/**
 * 🏷️ Devuelve el tipo de wallet actual.
 * @returns {string} El nombre de la wallet ("Phantom", "Backpack", "Magic Eden Wallet", "Desconocida").
 */
export const getWalletType = () => {
  const provider = getSolanaProvider();
  if (provider?.isPhantom) return "Phantom";
  if (provider?.isBackpack) return "Backpack";
  if (provider?.isMagicEden) return "Magic Eden Wallet";
  return "Desconocida";
};
