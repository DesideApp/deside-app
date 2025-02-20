import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, isTokenExpired } from '../../services/tokenService'; 
import { getConnectedWallet } from '../../services/walletService'; 

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const WALLET_STATUS = {
  NOT_CONNECTED: 'not_connected',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
};

export const WalletProvider = ({ children }) => {
  const [jwt, setJwt] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [walletStatus, setWalletStatus] = useState(WALLET_STATUS.NOT_CONNECTED);

  useEffect(() => {
    const token = getToken();
    setJwt(token && !isTokenExpired() ? token : null);

    const fetchWalletState = async () => {
      try {
        const walletState = await getConnectedWallet();
        setWalletAddress(walletState.walletAddress);
        setWalletStatus(walletState.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED);
      } catch (error) {
        console.error("❌ Error al obtener el estado de la wallet:", error);
        setWalletStatus(WALLET_STATUS.NOT_CONNECTED); // 🔥 En caso de error, marcamos la wallet como no conectada
      }
    };

    fetchWalletState().catch(error => console.error("❌ Error en fetchWalletState:", error)); // 🔥 Evitamos fallos silenciosos
  }, []);

  return (
    <WalletContext.Provider value={{ jwt, walletAddress, walletType, walletStatus }}>
      {children} 
    </WalletContext.Provider>
  );
};
