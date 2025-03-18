/**
 * 📂 walletBalanceService.js - Maneja la obtención del balance de la wallet en Solana.
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getPublicKey } from "./walletService";

// URL del RPC de Solana (puedes cambiarla si tienes un RPC privado)
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

/**
 * 💰 Obtiene el balance de la wallet conectada en SOL.
 * @returns {Promise<number>} Balance en SOL o `0` si hay error.
 */
export const getWalletBalance = async () => {
  try {
    const publicKeyString = getPublicKey();
    if (!publicKeyString) throw new Error("No hay wallet conectada.");

    const publicKey = new PublicKey(publicKeyString);
    const balanceLamports = await connection.getBalance(publicKey);
    return balanceLamports / 1e9; // Convertimos de lamports a SOL
  } catch (error) {
    console.error(`❌ Error al obtener balance: ${error.message}`);
    return 0;
  }
};
