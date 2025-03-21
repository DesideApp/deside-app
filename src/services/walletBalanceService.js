import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = "https://solana-mainnet.rpc.extrnode.com";  // En producción considera QuickNode u otro RPC privado robusto.
const connection = new Connection(RPC_URL, "confirmed");

/**
 * 💰 Obtiene el balance SOL desde la blockchain Solana.
 * @param {string} pubkey - PublicKey en formato string.
 * @returns {Promise<number>} - Balance en SOL (devuelve 0 en caso de error).
 */
export const getWalletBalance = async (pubkey) => {
  try {
    const publicKey = new PublicKey(pubkey);
    const lamports = await connection.getBalance(publicKey);
    return lamports / 1e9;
  } catch {
    return 0; // Manejo silencioso de errores para no romper la UX.
  }
};
