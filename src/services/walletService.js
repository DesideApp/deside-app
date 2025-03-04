import { getProvider } from "./walletProviders";
import { authenticateWithServer } from "./apiService";
import bs58 from "bs58";

const WALLET_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

/**
 * 🔹 **Conectar la wallet**
 */
export async function connectWallet(wallet) {
  try {
    console.log(`🔵 Intentando conectar con ${wallet}...`);
    const provider = getProvider(wallet);
    if (!provider) return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: "Provider not found" };

    await provider.connect();
    const pubkey = provider.publicKey?.toBase58() || null;

    if (!pubkey) throw new Error("No se obtuvo clave pública después de conectar.");

    console.log(`✅ Wallet conectada: ${pubkey}`);
    return { pubkey, status: WALLET_STATUS.CONNECTED };
  } catch (error) {
    console.error("❌ Error conectando wallet:", error);
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Error desconocido" };
  }
}

/**
 * 🔹 **Desconectar la wallet**
 */
export async function disconnectWallet() {
  try {
    if (window.solana?.disconnect) {
      await window.solana.disconnect();
    }
    console.log("🔴 Wallet desconectada correctamente.");
  } catch (error) {
    console.error("❌ Error desconectando wallet:", error);
  }
}

/**
 * 🔹 **Obtener estado de la wallet**
 */
export async function getConnectedWallet() {
  try {
    if (!window.solana?.isConnected) {
      return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED };
    }

    const walletAddress = window.solana.publicKey?.toBase58() || null;

    if (!walletAddress) {
      return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED };
    }

    const authResponse = await fetch("/api/auth/status", {
      method: "GET",
      credentials: "include",
    });

    if (!authResponse.ok) {
      return { walletAddress, walletStatus: WALLET_STATUS.CONNECTED };
    }

    const authData = await authResponse.json();
    return {
      walletAddress,
      walletStatus: authData.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED,
    };
  } catch (error) {
    console.error("❌ Error obteniendo estado de la wallet:", error);
    return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Error desconocido" };
  }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
  try {
    console.log(`🟡 Solicitando firma a ${wallet}...`);
    const provider = getProvider(wallet);
    if (!provider) throw new Error("No provider found");

    const encodedMessage = new TextEncoder().encode(message);
    const signatureResponse = await provider.signMessage(encodedMessage);

    if (!signatureResponse?.signature) throw new Error("Firma fallida o rechazada.");

    const signatureBase58 = bs58.encode(signatureResponse.signature);
    console.log("✅ Firma generada:", signatureBase58);

    return { signature: signatureBase58, message, pubkey: provider.publicKey.toBase58() };
  } catch (error) {
    console.error("❌ Error en signMessage():", error.message || error);
    return { signature: null, error: error.message || "Error desconocido" };
  }
}

/**
 * 🔹 **Autenticar wallet con el backend**
 */
export async function authenticateWallet(wallet) {
  try {
    const { walletAddress, walletStatus } = await getConnectedWallet();

    if (!walletAddress) {
      return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED };
    }

    if (walletStatus === WALLET_STATUS.AUTHENTICATED) {
      return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
    }

    console.log("🔄 Iniciando autenticación...");
    const message = "Please sign this message to authenticate.";
    const signedData = await signMessage(wallet, message);

    if (!signedData.signature) {
      return { pubkey: null, status: "signature_failed" };
    }

    console.log("🔵 Enviando firma al backend...");
    const response = await authenticateWithServer(
      signedData.pubkey,
      signedData.signature,
      message
    );

    if (!response || !response.message) {
      return { pubkey: null, status: "server_error" };
    }

    console.log("✅ Autenticación exitosa en backend.");
    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
  } catch (error) {
    console.error("❌ Error en authenticateWallet():", error.message || error);
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Error desconocido" };
  }
}
