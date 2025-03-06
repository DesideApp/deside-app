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
 * @returns {{walletAddress: string, selectedWallet: string} | {walletAddress: null}}
 */
export async function getConnectedWallet() {
  try {
    const connected = isWalletConnected();
    return connected ? { walletAddress: connected.pubkey, selectedWallet: connected.wallet } : { walletAddress: null };
  } catch {
    return { walletAddress: null };
  }
}

/**
 * 💰 **Obtener balance de una wallet conectada**
 * @param {string} walletAddress - Dirección pública de la wallet.
 * @param {string} selectedWallet - Proveedor de la wallet (phantom, backpack, magiceden).
 * @returns {Promise<number|null>} - Balance en SOL o `null` en caso de error.
 */
export async function getWalletBalance(walletAddress, selectedWallet) {
  try {
    if (!walletAddress || !selectedWallet) throw new Error("❌ Wallet no proporcionada.");

    // ✅ **Obtener el balance desde el proveedor Web3**
    const provider = getProvider(selectedWallet);
    if (provider?.isConnected && provider?.publicKey?.toBase58() === walletAddress) {
      console.log(`🔍 Consultando balance a través del proveedor: ${selectedWallet}`);

      try {
        const balanceLamports = await provider.request({ method: "getBalance", params: [] });
        return balanceLamports / 1e9; // ✅ Convertir de lamports a SOL
      } catch (providerError) {
        console.error(`❌ Error al obtener balance desde ${selectedWallet}:`, providerError);
        return null;
      }
    }

    console.warn(`⚠️ No se pudo obtener balance, la wallet no está conectada.`);
    return null;
  } catch (error) {
    console.error(`❌ Error obteniendo balance para ${walletAddress}:`, error);
    return null;
  }
}

/**
 * 🔹 **Conectar wallet manualmente**
 * @param {string} wallet - Nombre del proveedor de la wallet (phantom, backpack, magiceden).
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
    return { pubkey: null, error: error.message };
  }
}

/**
 * 🔹 **Desconectar la wallet actual**
 * @param {string} [selectedWallet] - (Opcional) Si no se pasa, se desconecta la wallet activa.
 */
export async function disconnectWallet(selectedWallet) {
  try {
    const wallet = selectedWallet || isWalletConnected()?.wallet;
    if (!wallet) return; // ✅ Evitamos ejecutar si no hay una wallet conectada

    const provider = getProvider(wallet);
    if (provider?.isConnected) {
      await provider.disconnect();
      window.dispatchEvent(new Event("walletDisconnected"));
    }
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
    if (!signedData.signature) return { pubkey: null, status: "signature_failed" }; // ✅ Detenemos aquí si falla la firma

    const response = await authenticateWithServer(signedData.pubkey, signedData.signature, signedData.message);
    if (!response?.message) return { pubkey: null, status: "server_error" };

    window.dispatchEvent(new CustomEvent("walletAuthenticated", { detail: { wallet, pubkey: walletAddress } }));
    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
  } catch (error) {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message };
  }
}

/**
 * 🔹 **Cerrar sesión completamente (NO desconecta la wallet)**
 */
export async function handleLogout(syncWalletStatus) {
  try {
    await apiLogout();
  } catch {
    console.warn("⚠️ No se pudo cerrar sesión en el backend.");
  }
  syncWalletStatus();
  window.dispatchEvent(new Event("walletDisconnected"));
}
