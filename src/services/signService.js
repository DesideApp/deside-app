import { getProvider } from "./walletService";
import bs58 from "bs58";

/**
 * Firma un mensaje de texto usando la wallet conectada.
 *
 * @param {string} message - Texto plano a firmar.
 * @returns {Promise<string>} Firma en base58.
 * @throws {Error} Si la wallet no permite firmar o si ocurre un error.
 */
export async function signTextMessage(message) {
  const provider = getProvider();

  if (!provider?.signMessage) {
    throw new Error("La wallet no permite firmar mensajes.");
  }

  try {
    const encoded = new TextEncoder().encode(message);

    const signed = await provider.signMessage(encoded, "utf8");

    const signatureBase58 = bs58.encode(signed.signature);

    console.log("[signService] ✅ Mensaje firmado correctamente:", signatureBase58);

    return signatureBase58;
  } catch (error) {
    console.error("[signService] ❌ Error al firmar el mensaje:", error.message);
    throw new Error(`Error al firmar el mensaje: ${error.message}`);
  }
}
