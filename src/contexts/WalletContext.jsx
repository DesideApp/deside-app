import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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
  const isSynced = useRef(false); // 🔥 Controlar si ya sincronizamos

  const syncWalletStatus = useCallback(async () => {
    if (isSynced.current) return; // 🔥 Evita múltiples ejecuciones innecesarias

    console.log("🟡 Obteniendo estado de autenticación...");
    const authStatus = await fetchAuthStatus();

    // 🔥 Solo actualizamos si hay cambios reales para evitar re-render innecesario
    if (authStatus.isAuthenticated && walletStatus !== WALLET_STATUS.AUTHENTICATED) {
      setWalletAddress(authStatus.wallet);
      setWalletStatus(WALLET_STATUS.AUTHENTICATED);
    } else if (authStatus.wallet && walletStatus !== WALLET_STATUS.CONNECTED) {
      setWalletAddress(authStatus.wallet);
      setWalletStatus(WALLET_STATUS.CONNECTED);
    } else if (!authStatus.wallet && walletStatus !== WALLET_STATUS.NOT_CONNECTED) {
      setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
    }

    setIsReady(true);
    isSynced.current = true; // ✅ Marcamos que ya sincronizamos
  }, [walletStatus]); // ✅ Se ejecuta solo cuando cambia `walletStatus`

  useEffect(() => {
    syncWalletStatus();
  }, [syncWalletStatus]);

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
