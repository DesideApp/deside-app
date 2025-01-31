import React, { useState, useEffect } from 'react';
import { getConnectedWallet, connectWallet, disconnectWallet } from '../utils/solanaHelpers';
import './WalletMenu.css';

const WalletMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Escucha los eventos de conexión y desconexión
    const updateConnectionStatus = async () => {
      const connectedWallet = getConnectedWallet();
      if (connectedWallet) {
        setWalletConnected(true);
        setWalletAddress(connectedWallet.walletAddress);
      } else {
        setWalletConnected(false);
        setWalletAddress(null);
      }
    };
    updateConnectionStatus();
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <div>
      <button onClick={toggleMenu}>
        {walletConnected ? `Wallet: ${walletAddress}` : 'Connect Wallet'}
      </button>
      {isMenuOpen && (
        <div className="wallet-menu">
          {walletConnected ? (
            <>
              <p>{walletAddress}</p>
              <button onClick={disconnectWallet}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => connectWallet('phantom')}>Phantom</button>
              <button onClick={() => connectWallet('backpack')}>Backpack</button>
              <button onClick={() => connectWallet('magiceden')}>Magic Eden</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletMenu;
