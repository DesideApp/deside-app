import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, isTokenExpired } from '../services/tokenService';
import { getConnectedWallet } from '../services/walletService';

const WalletContext = createContext();

// ✅ Verificación añadida para evitar el error de contexto fuera del proveedor
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

  const [jwt, setJwt] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [walletStatus, setWalletStatus] = useState(WALLET_STATUS.NOT_CONNECTED);
  const [isLoading, setIsLoading] = useState(true); // ✅ Estado de carga
  const [isReady, setIsReady] = useState(false); // ✅ Nuevo estado para confirmar si el contexto está listo

  useEffect(() => {
    console.log("🟡 Ejecutando useEffect en WalletProvider");

    const fetchData = async () => {
      try {
        console.log("🟡 Obteniendo JWT...");
        const token = getToken();
        setJwt(token && !isTokenExpired() ? token : null);
        console.log("✅ JWT procesado correctamente.");

        console.log("🟡 Obteniendo estado de la Wallet...");
        const walletState = await getConnectedWallet();
        console.log("✅ Estado de la wallet recibido:", walletState);

        if (walletState) {
          setWalletAddress(walletState.walletAddress || null);
          setWalletType(walletState.walletType || null);
          setWalletStatus(walletState.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED);
          console.log("✅ Wallet actualizada en el estado.");
        } else {
          console.warn("⚠️ WalletState no recibido correctamente.");
          setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
        }
      } catch (error) {
        console.error("❌ Error en fetchData():", error);
        setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
      } finally {
        setIsLoading(false); // ✅ Indicar que la carga ha terminado
        setIsReady(true); // ✅ Indicar que el contexto está listo
      }
    };

    fetchData().catch(err => console.error("❌ Error en fetchData ejecución:", err));

  }, []);

  // ✅ Mostrar pantalla de carga mientras se espera el estado de la wallet
  if (isLoading || !isReady) {
    return <div>Cargando estado de la wallet...</div>;
  }

  return (
    <WalletContext.Provider value={{ jwt, walletAddress, walletType, walletStatus, isReady }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
