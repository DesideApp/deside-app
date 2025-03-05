import { getProvider } from "./walletProviders";
import { authenticateWithServer, checkAuthStatus, logout as apiLogout } from "./apiService";
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
    if (!provider) throw new Error("No encontramos tu wallet. Intenta instalarla y vuelve a intentarlo.");

    if (provider.isConnected) {
      return { pubkey: provider.publicKey?.toBase58(), status: WALLET_STATUS.CONNECTED };
    }

    await provider.connect();
    const pubkey = provider.publicKey?.toBase58();
    if (!pubkey) throw new Error("No se pudo obtener la clave pública.");

    window.dispatchEvent(new Event("walletConnected")); // 🔄 Emitir evento global

    return { pubkey, status: WALLET_STATUS.CONNECTED };
  } catch (error) {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message };
  }
}

/**
 * 🔹 **Desconectar la wallet**
 */
export async function disconnectWallet() {
  try {
    const availableWallets = ["phantom", "backpack", "magiceden"];

    for (const wallet of availableWallets) {
      const provider = getProvider(wallet);
      if (provider?.isConnected) {
        await provider.disconnect();
        console.log(`❌ ${wallet} desconectada.`);
      }
    }

    window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Emitir evento global
  } catch (error) {
    console.error("❌ Wallet disconnection error:", error);
  }
}

/**
 * 🔹 **Obtener estado de la wallet (ahora revisa todas sin esperar autenticación)**
 */
export async function getConnectedWallet() {
  try {
    const availableWallets = ["phantom", "backpack", "magiceden"];

    for (const wallet of availableWallets) {
      const provider = getProvider(wallet);
      if (provider?.isConnected) { // ✅ Detecta conexión directa sin abrir modal
        const walletAddress = provider.publicKey?.toBase58();
        if (!walletAddress) continue;

        console.log(`✅ Wallet detectada automáticamente: ${wallet} (${walletAddress})`);

        return {
          walletAddress,
          walletStatus: WALLET_STATUS.CONNECTED, // 🔹 No esperamos al backend, es inmediato
          selectedWallet: wallet,
        };
      }
    }

    return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED };
  } catch (error) {
    return { walletAddress: null, walletStatus: WALLET_STATUS.NOT_CONNECTED, error: error.message };
  }
}

/**
 * 🔹 **Firmar mensaje con la wallet**
 */
async function signMessage(wallet, message) {
  try {
    const provider = getProvider(wallet);
    if (!provider || !provider.isConnected) throw new Error("No encontramos tu wallet. Intenta reconectarla.");

    const encodedMessage = new TextEncoder().encode(message);
    const signatureResponse = await provider.signMessage(encodedMessage);

    if (!signatureResponse?.signature) throw new Error("Firma cancelada. Para continuar, necesitas firmar el mensaje de autenticación.");

    return {
      signature: bs58.encode(signatureResponse.signature),
      message,
      pubkey: provider.publicKey.toBase58(),
    };
  } catch (error) {
    return { signature: null, error: error.message };
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
    if (!response || !response.message) {
      return { pubkey: null, status: "server_error", error: "No pudimos verificar tu identidad. Intenta reconectar tu wallet." };
    }

    window.dispatchEvent(new Event("walletAuthenticated")); // 🔄 Emitir evento global
    return { pubkey: walletAddress, status: WALLET_STATUS.AUTHENTICATED };
  } catch (error) {
    return { pubkey: null, status: WALLET_STATUS.NOT_CONNECTED, error: error.message };
  }
}

/**
 * 🔹 **Manejar autenticación tras conectar la wallet**
 */
export async function handleWalletConnected(syncWalletStatus) {
  console.log("🔄 Revisando conexión automática de wallet...");

  const { walletAddress, walletStatus, selectedWallet } = await getConnectedWallet();
  if (!walletAddress) {
    console.warn("⚠️ No hay wallet conectada al iniciar.");
    return;
  }

  console.log(`✅ Conexión detectada: ${selectedWallet} (${walletAddress})`);

  if (walletStatus === WALLET_STATUS.AUTHENTICATED) {
    console.log("✅ Usuario ya autenticado.");
    syncWalletStatus();
    return;
  }

  console.log("🔄 Autenticando automáticamente...");
  await authenticateWallet(selectedWallet);
  syncWalletStatus();
}

/**
 * 🔹 **Cerrar sesión completamente**
 */
export async function handleLogout(syncWalletStatus) {
  console.log("🚪 Cierre de sesión iniciado...");
  await disconnectWallet();
  await apiLogout();
  syncWalletStatus();
  window.dispatchEvent(new Event("walletDisconnected")); // 🔄 Emitir evento global
  console.log("✅ Sesión cerrada correctamente.");
}
