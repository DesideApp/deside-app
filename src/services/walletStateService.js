import { useWallet } from "../contexts/WalletContext.jsx"; 
import { clearSession } from "./tokenService"; 
import { authenticateWallet } from "./walletAuthService";
import { checkAuthStatus } from "./authServices"; 

// 📌 **Definimos estados en base a lo que dice el backend**
const STATES = {
  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

// 🔥 **Consulta el estado desde el backend**
async function determineWalletState() {
  const { walletAddress, isReady } = useWallet();

  if (!isReady) {
    console.warn("⏳ Contexto aún no listo.");
    return { state: "LOADING", actions: [] };
  }

  const authStatus = await checkAuthStatus();

  return {
    state: authStatus.isAuthenticated
      ? STATES.AUTHENTICATED
      : walletAddress
      ? STATES.CONNECTED
      : STATES.DISCONNECTED,
    actions: authStatus.isAuthenticated
      ? ["NO_ACTION"]
      : walletAddress
      ? ["AUTHENTICATE_WALLET"]
      : ["OPEN_MODAL"],
  };
}

// 🔥 **Ejecuta las acciones necesarias**
async function executeWalletAction({ actions }) {
  for (const action of actions) {
    switch (action) {
      case "OPEN_MODAL":
        console.log("🛑 Wallet no conectada, abrir modal.");
        window.dispatchEvent(new Event("openWalletModal"));
        break;
      case "AUTHENTICATE_WALLET":
        console.log("🖊 Autenticando wallet con firma...");
        await authenticateWallet();
        break;
      case "NO_ACTION":
      default:
        console.log("✅ Estado correcto, sin acción requerida.");
        break;
    }
  }
}

// 🔥 **Punto de entrada para verificar y sincronizar estado**
async function ensureWalletState() {
  const stateData = await determineWalletState(); 
  if (stateData.state === "LOADING") {
    console.warn("⏳ Esperando que el contexto esté listo...");
    return "LOADING";
  }
  await executeWalletAction(stateData);
  return stateData.state;
}

export { ensureWalletState };
