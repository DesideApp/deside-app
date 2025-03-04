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
    const provider = getProvider(wallet);
    if (!provider) throw new Error("Wallet provider not found");

    if (provider.isConnected) {
      return { pubkey: provider.publicKey?.toBase58(), status: WALLET_STATUS.CONNECTED };
    }

    await provider.connect();
    const pubkey = provider.publicKey?.toBase58();
    if (!pubkey) throw new Error("No public key retrieved after connecting.");

    return { pubkey, status: WALLET_STATUS.CONNECTED };
  } catch (error) {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Unknown error" };
  }
}

/**
 * 🔹 **Desconectar la wallet**
 */
export async function disconnectWallet() {
  try {
    const provider = getProvider("phantom"); // Puedes generalizar si hay más wallets
    if (!provider || !provider.isConnected) return;

    await provider.disconnect();
  } catch (error) {
    console.error("❌ Wallet disconnection error:", error);
  }
}

/**
 * 🔹 **Obtener estado de la wallet**
 */
export async function getConnectedWallet() {
  try {
    const provider = getProvider("phantom");
    if (!provider || !provider.isConnected) {
      return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED };
    }

    const walletAddress = provider.publicKey?.toBase58() || null;
    if (!walletAddress) return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED };

    const authResponse = await fetch("/api/auth/status", {
      method: "GET",
      credentials: "include",
    });

    if (!authResponse.ok) return { walletAddress, walletStatus: WALLET_STATUS.CONNECTED };

    const authData = await authResponse.json();
    return {
      walletAddress,
      walletStatus: authData.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED,
    };
  } catch (error) {
    return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Unknown error" };
  }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
  try {
    const provider = getProvider(wallet);
    if (!provider || !provider.isConnected) throw new Error("Wallet provider not found or not connected");

    const encodedMessage = new TextEncoder().encode(message);
    const signatureResponse = await provider.signMessage(encodedMessage);

    if (!signatureResponse?.signature) throw new Error("Signature failed or rejected.");

    return {
      signature: bs58.encode(signatureResponse.signature),
      message,
      pubkey: provider.publicKey.toBase58(),
    };
  } catch (error) {
    return { signature: null, error: error.message || "Unknown error" };
  }
}

/**
 * 🔹 **Autenticar wallet con el backend**
 */
export async function authenticateWallet(wallet) {
  try {
    const { walletAddress, walletStatus } = await getConnectedWallet();
    if (!walletAddress) return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED };

    if (walletStatus === WALLET_STATUS.AUTHENTICATED) {
      return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
    }

    const message = "Please sign this message to authenticate.";
    const signedData = await signMessage(wallet, message);
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    const response = await authenticateWithServer(signedData.pubkey, signedData.signature, message);
    if (!response || !response.message) return { pubkey: null, status: "server_error" };

    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
  } catch (error) {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message || "Unknown error" };
  }
}
