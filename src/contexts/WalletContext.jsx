import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

// ✅ Función optimizada para obtener el estado de autenticación desde el backend
const fetchAuthStatus = async () => {
  try {
    const response = await fetch("/api/auth/status", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch authentication status");

    const data = await response.json();
    return {
      isAuthenticated: !!data.isAuthenticated,
      wallet: data.wallet || null,
    };
  } catch (error) {
    console.error("❌ Error fetching authentication status:", error);
    return { isAuthenticated: false, wallet: null };
  }
};

// ✅ Creación del contexto de la wallet
const WalletContext = createContext();

// ✅ Hook para acceder al contexto de la wallet de manera segura
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};

// 🔹 Estados posibles de la wallet
const WALLET_STATUS = {
  NOT_CONNECTED: "not_connected",
  CONNECTED: "connected",
  AUTHENTICATED: "authenticated",
};

// ✅ Proveedor del contexto de la wallet
export const WalletProvider = ({ children }) => {
  console.log("🔵 WalletProvider Mounted");

  const [walletAddress, setWalletAddress] = useState(null);
  const [walletStatus, setWalletStatus] = useState(WALLET_STATUS.NOT_CONNECTED);
  const [isReady, setIsReady] = useState(false);

  // ✅ Función para sincronizar el estado de la wallet
  const syncWalletStatus = useCallback(async () => {
    console.log("🟡 Syncing wallet authentication status...");
    const authStatus = await fetchAuthStatus();

    setWalletAddress(authStatus.wallet);
    setWalletStatus(
      authStatus.isAuthenticated
        ? WALLET_STATUS.AUTHENTICATED
        : authStatus.wallet
        ? WALLET_STATUS.CONNECTED
        : WALLET_STATUS.NOT_CONNECTED
    );

    setIsReady(true);
  }, []);

  // ✅ Se ejecuta solo una vez para evitar llamadas dobles en `React.StrictMode`
  useEffect(() => {
    syncWalletStatus();
  }, [syncWalletStatus]);

  // ✅ Memorizamos el contexto para evitar re-render innecesarios
  const walletContextValue = useMemo(() => ({
    walletAddress,
    walletStatus,
    isReady,
    syncWalletStatus,
  }), [walletAddress, walletStatus, isReady]);

  if (!isReady) {
    return <div className="loading-screen">🔄 Loading wallet state...</div>;
  }

  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
