import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, isTokenExpired } from '../../services/tokenService'; 
import { getConnectedWallet } from '../../services/walletService'; 

// ✅ 1. SOLO maneja estados globales, sin lógica extra.
const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

// ✅ 2. Define estados de la wallet
const WALLET_STATUS = {
  NOT_CONNECTED: 'not_connected',
  CONNECTED: 'connected',
  AUTHENTICATED: 'authenticated',
};

// ✅ 3. Proveedor del contexto
export const WalletProvider = ({ children }) => {
  const [jwt, setJwt] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [walletStatus, setWalletStatus] = useState(WALLET_STATUS.NOT_CONNECTED);

  // ✅ 4. useEffect SOLO para actualizar los estados globales, SIN lógica extra.
  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      setJwt(token && !isTokenExpired() ? token : null);

      const walletState = await getConnectedWallet();
      setWalletAddress(walletState?.walletAddress || null);
      setWalletType(walletState?.walletType || null);
      setWalletStatus(walletState?.isAuthenticated ? WALLET_STATUS.AUTHENTICATED : WALLET_STATUS.CONNECTED);
    }

    fetchData().catch(err => console.error("❌ Error en fetchData:", err));
  }, []);

  return (
    <WalletContext.Provider value={{ jwt, walletAddress, walletType, walletStatus }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletProvider;
