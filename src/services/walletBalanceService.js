/**
 * 📂 walletBalanceService.js - Maneja balance y conversión a SOL
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { getPublicKey } from "./walletService";

// Configuración flexible de RPC
const SOLANA_RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

/**
 * 💰 Obtiene balance actualizado con manejo robusto de errores
 * @param {string} [customRpc] - URL opcional de RPC personalizado
 * @returns {Promise<number>} Balance en SOL (0 si falla)
 */
export const getWalletBalance = async (customRpc) => {
  try {
    const publicKeyString = getPublicKey();
    
    // Validación reforzada
    if (!publicKeyString || !PublicKey.isOnCurve(publicKeyString)) {
      throw new Error("Clave pública inválida o no conectada");
    }

    // Usar RPC personalizado si se provee
    const activeConnection = customRpc 
      ? new Connection(customRpc, "confirmed")
      : connection;

    const publicKey = new PublicKey(publicKeyString);
    const balanceLamports = await activeConnection.getBalance(publicKey, "confirmed");
    
    // Validar respuesta numérica
    if (typeof balanceLamports !== "number") {
      throw new Error("Respuesta de balance inválida");
    }

    return parseFloat((balanceLamports / 1e9).toFixed(4)); // 4 decimales

  } catch (error) {
    console.error(`❌ Balance Error: ${error.message}`);
    return 0;
  }
};