import React, { createContext, useContext, useState, useEffect } from 'react';

// ✅ Nueva función para obtener el estado desde el backend
const fetchAuthStatus = async () => {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include',
    });

    if (!response.ok) throw new Error('No se pudo obtener el estado de autenticación');

    return await response.json();
  } catch (error) {
    console.error('❌ Error al obtener el estado de autenticación:', error);
    return { isAuthenticated: false, wallet: null };
  }
};

const WalletContext = createContext();

// ✅ Hook para acceder al contexto de manera segura
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet debe ser usado dentro de un WalletProvider");
  }
  return context;
};

const WALLET_STATUS = {
  NOT_CONNECTED: 'not_connected',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
};

export const WalletProvider = ({ children }) => {
  console.log("🔵 WalletProvider Montado");

  const [walletAddress, setWalletAddress] = useState(null);
  const [walletStatus, setWalletStatus] = useState(WALLET_STATUS.NOT_CONNECTED);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log("🟡 Obteniendo estado de autenticación...");

    const syncWalletStatus = async () => {
      const authStatus = await fetchAuthStatus();

      if (authStatus.isAuthenticated) {
        setWalletAddress(authStatus.wallet);
        setWalletStatus(WALLET_STATUS.AUTHENTICATED);
      } else if (authStatus.wallet) {
        setWalletAddress(authStatus.wallet);
        setWalletStatus(WALLET_STATUS.CONNECTED);
      } else {
        setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
      }

      setIsReady(true);
    };

    syncWalletStatus();
  }, []);

  // ✅ Mostrar pantalla de carga mientras se espera la autenticación
  if (!isReady) {
    return <div>Cargando estado de la wallet...</div>;
  }

  return (
    <WalletContext.Provider value={{ walletAddress, walletStatus, isReady }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
