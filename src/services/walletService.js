import { getProvider, isWalletConnected } from "./walletProviders";
import { authenticateWithServer, logout as apiLogout } from "./apiService";
import bs58 from "bs58";

const WALLET_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

/**
 * 🔍 **Detectar wallet conectada a nivel Web3 (NO backend)**
 */
export async function getConnectedWallet() {
  return isWalletConnected() || { walletAddress: null };
}

/**
 * 💰 **Obtener balance de una wallet conectada**
 */
export async function getWalletBalance(walletAddress, selectedWallet) {
  try {
    if (!walletAddress || !selectedWallet) throw new Error("❌ Wallet no proporcionada.");

    const provider = getProvider(selectedWallet);
    if (provider?.isConnected && provider?.publicKey?.toBase58() === walletAddress) {
      const connection = provider.connection;
      const balanceLamports = await connection.getBalance(provider.publicKey);
      return balanceLamports / 1e9;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 🔹 **Conectar wallet manualmente**
 */
export async function connectWallet(wallet) {
  try {
    const provider = getProvider(wallet);
    if (!provider) throw new Error("No encontramos tu wallet. Instálala e intenta de nuevo.");

    // 🚀 **Forzar `connect()` para que siempre muestre el popup**
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
export async function disconnectWallet(selectedWallet) {
  try {
    const wallet = selectedWallet || isWalletConnected()?.wallet;
    if (!wallet) return;

    const provider = getProvider(wallet);
    if (!provider?.isConnected) return;

    await provider.disconnect();
  } catch {
    console.warn("⚠️ No se pudo desconectar la wallet.");
  }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
  try {
    const provider = getProvider(wallet);
    if (!provider?.isConnected || !provider.signMessage) throw new Error("❌ Wallet no encontrada o no soporta firma.");

    const signedMessage = await provider.signMessage(new TextEncoder().encode(message));
    return { signature: bs58.encode(signedMessage), message, pubkey: provider.publicKey.toBase58() };
  } catch (error) {
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

    const signedData = await signMessage(wallet, "Please sign this message to authenticate.");
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" };

    const response = await authenticateWithServer(signedData.pubkey, signedData.signature, signedData.message);
    if (!response?.message) return { pubkey: null, status: "server_error" };

    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
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
  syncWalletStatus();
}
