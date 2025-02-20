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
    async function fetchData() {
      try {
        // ✅ Verificar token JWT
        const token = getToken();
        setJwt(token && !isTokenExpired() ? token : null);

        // ✅ Obtener estado de la wallet
        const walletState = await getConnectedWallet();
        if (walletState) {
          setWalletAddress(walletState.walletAddress || null);
          setWalletType(walletState.walletType || null);
          setWalletStatus(walletState.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED);
        } else {
          setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
        }
      } catch (error) {
        console.error("❌ Error en fetchData():", error);
        setWalletStatus(WALLET_STATUS.NOT_CONNECTED);
      }
    }

    fetchData();

  }, []); // ✅ Eliminamos dependencias innecesarias

  return (
    <WalletContext.Provider value={{ jwt, walletAddress, walletType, walletStatus }}>
      {children} 
    </WalletContext.Provider>
  );
};
