import { getPhantomProvider, isPhantomConnected, getPhantomBalance } from "./walletProviders";
import { authenticateWithServer, logout as apiLogout } from "./apiService";
import bs58 from "bs58";

const WALLET_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

/**
 * 💰 **Obtener balance de una wallet conectada (Usando `walletProviders`)**
 */
export async function getWalletBalance() {
  return await getPhantomBalance();
}

/**
 * 🔹 **Conectar wallet manualmente**
 */
export async function connectWallet() {
  try {
    const provider = getPhantomProvider();
    if (!provider) throw new Error("Phantom no está disponible. Instálalo e intenta de nuevo.");

    // 🚀 **Si ya está conectada, devolver la clave pública**
    if (provider.isConnected && provider.publicKey) {
      return { pubkey: provider.publicKey.toBase58() };
    }

    // 🚀 **Intentar conectar la wallet**
    await provider.connect();
    if (!provider.publicKey) throw new Error("No se pudo obtener la clave pública.");

    return { pubkey: provider.publicKey.toBase58() };
  } catch (error) {
    return { pubkey: null, error: error.message };
  }
}

/**
 * 🔹 **Desconectar la wallet actual**
 */
export async function disconnectWallet() {
  try {
    const provider = getPhantomProvider();
    if (provider?.isConnected) {
      await provider.disconnect();
    }
  } catch {
    console.warn("⚠️ No se pudo desconectar Phantom.");
  }
}

/**
 * 🔹 **Firmar mensaje con Phantom**
 */
export async function signMessage(message) {
  try {
    const provider = getPhantomProvider();
    if (!provider?.isConnected || !provider.signMessage) throw new Error("Phantom no está disponible o no soporta firma.");

    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await provider.signMessage(encodedMessage);

    return {
      signature: bs58.encode(signedMessage),
      message,
      pubkey: provider.publicKey.toBase58(),
    };
  } catch (error) {
    return { signature: null, error: error.message };
  }
}

/**
 * 🔹 **Autenticar la wallet con el backend**
 */
export async function authenticateWallet() {
  try {
    const connectedWallet = isPhantomConnected();
    if (!connectedWallet) return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED };

    const signedData = await signMessage("Please sign this message to authenticate.");
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    // 🚀 **Asegurar que la autenticación es con la wallet correcta**
    if (connectedWallet.pubkey !== signedData.pubkey) {
      return { pubkey: null, status: "wallet_mismatch" };
    }

    const response = await authenticateWithServer(signedData.pubkey, signedData.signature, signedData.message);
    if (!response?.message) return { pubkey: null, status: "server_error" };

    return { pubkey: connectedWallet.pubkey, status: WALLET_STATUS.AUTHENTICATED };
  } catch {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED };
  }
}

/**
 * 🔹 **Cerrar sesión completamente (Desconecta Web3 y backend)**
 */
export async function handleLogout(syncWalletStatus) {
  try {
    await apiLogout();
  } catch {
    console.warn("⚠️ No se pudo cerrar sesión en el backend.");
  }
  await disconnectWallet();
  if (syncWalletStatus) syncWalletStatus();
}
