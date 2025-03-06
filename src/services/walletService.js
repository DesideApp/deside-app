import { getProvider } from "./walletProviders";
import { authenticateWithServer, logout as apiLogout } from "./apiService";
import bs58 from "bs58";

const WALLET_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

/**
 * 🔹 **Detectar wallet conectada a nivel Web3 (NO backend)**
 */
export async function getConnectedWallet() {
  try {
    const availableWallets = ["phantom", "backpack", "magiceden"];

    for (const wallet of availableWallets) {
      const provider = getProvider(wallet);
      if (provider?.isConnected && provider.publicKey) {
        return { walletAddress: provider.publicKey.toBase58(), selectedWallet: wallet };
      }
    }
    return { walletAddress: null };
  } catch (error) {
    console.error("❌ Error detectando wallet conectada:", error);
    return { walletAddress: null };
  }
}

/**
 * 🔹 **Conectar wallet manualmente**
 */
export async function connectWallet(wallet) {
  try {
    const provider = getProvider(wallet);
    if (!provider) throw new Error("No encontramos tu wallet. Instálala e intenta de nuevo.");

    await provider.connect();
    const pubkey = provider.publicKey?.toBase58();
    if (!pubkey) throw new Error("No se pudo obtener la clave pública.");

    window.dispatchEvent(new CustomEvent("walletConnected", { detail: { wallet, pubkey } }));
    return { pubkey };
  } catch (error) {
    console.error(`❌ Error conectando wallet ${wallet}:`, error);
    return { pubkey: null, error: error.message };
  }
}

/**
 * 🔹 **Desconectar la wallet actual**
 */
export async function disconnectWallet() {
  try {
    const { selectedWallet } = await getConnectedWallet();
    if (!selectedWallet) return;

    const provider = getProvider(selectedWallet);
    if (provider?.isConnected) {
      await provider.disconnect();
      window.dispatchEvent(new Event("walletDisconnected"));
    }
  } catch (error) {
    console.error("❌ Error desconectando wallet:", error);
  }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
  try {
    const provider = getProvider(wallet);
    if (!provider?.isConnected) throw new Error("Wallet no encontrada. Intenta reconectarla.");
    if (!provider.signMessage) throw new Error("Este proveedor no soporta firma de mensajes.");

    const encodedMessage = new TextEncoder().encode(message);
    const signature = await provider.signMessage(encodedMessage);

    return {
      signature: bs58.encode(signature.signature),
      message,
      pubkey: provider.publicKey.toBase58(),
    };
  } catch (error) {
    console.error("❌ Error al firmar mensaje:", error);
    return { signature: null, error: error.message };
  }
}

/**
 * 🔹 **Autenticar la wallet con el backend**
 */
export async function authenticateWallet(wallet) {
  try {
    const { walletAddress } = await getConnectedWallet();
    if (!walletAddress) return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED };

    const message = "Please sign this message to authenticate.";
    const signedData = await signMessage(wallet, message);
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    const response = await authenticateWithServer(signedData.pubkey, signedData.signature, message);
    if (!response?.message) return { pubkey: null, status: "server_error" };

    window.dispatchEvent(new CustomEvent("walletAuthenticated", { detail: { wallet, pubkey: walletAddress } }));
    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
  } catch (error) {
    console.error("❌ Error en la autenticación:", error);
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message };
  }
}

/**
 * 🔹 **Cerrar sesión completamente (pero NO cerrar la wallet automáticamente)**
 */
export async function handleLogout(syncWalletStatus) {
  console.log("🚪 Cerrando sesión...");
  try {
    await apiLogout();
  } catch (error) {
    console.warn("⚠️ No se pudo cerrar sesión en el backend.");
  }
  syncWalletStatus();
  window.dispatchEvent(new Event("walletDisconnected"));
}
