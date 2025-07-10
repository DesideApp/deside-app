import { signMessageForLogin } from "./walletService";
import { authenticateWithServer } from "./apiService";

/**
 * 🔐 Autentica la wallet con el backend.
 * @returns {Promise<{pubkey: string | null, status: string, message?: string}>}
 */
export const authenticateWallet = async () => {
  try {
    const signedData = await signMessageForLogin("Please sign this message to authenticate.");

    if (!signedData.signature) {
      console.warn("[AuthService] ❌ Firma fallida o cancelada por el usuario.");
      return {
        pubkey: null,
        status: "signature_failed",
        message: "Firma rechazada o no obtenida.",
      };
    }

    console.log("[AuthService] ✅ Firma obtenida. Enviando al backend...");
    const result = await authenticateWithServer(
      signedData.pubkey,
      signedData.signature,
      signedData.message
    );

    if (!result || result?.nextStep !== "ACCESS_GRANTED") {
      console.error("[AuthService] ❌ Autenticación fallida en backend:", result);
      return {
        pubkey: null,
        status: "server_error",
        message: result?.error || "Error desconocido en el servidor.",
      };
    }

    console.log("[AuthService] ✅ Autenticación exitosa en backend.");
    return {
      pubkey: signedData.pubkey,
      status: "authenticated",
    };

  } catch (error) {
    console.error("[AuthService] ❌ Error en authenticateWallet:", error.message);
    return {
      pubkey: null,
      status: "authentication_failed",
      message: error.message || "Error desconocido.",
    };
  }
};
