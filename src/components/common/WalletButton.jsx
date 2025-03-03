import React, { useState, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaHelpers.js"; // ✅ Se usa la función centralizada
import { disconnectWallet } from "../../services/walletService.js";
import { checkAuthStatus, logout } from "../../services/apiService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
  const { walletStatus, walletAddress, isReady } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isReady || !walletAddress) return;

    const updateWalletStatus = async () => {
      const status = await checkAuthStatus();
      if (status.isAuthenticated) {
        setIsAuthenticated(true);
        const walletBalance = await getBalance(walletAddress);
        setBalance(walletBalance);
      } else {
        setIsAuthenticated(false);
        setBalance(0); // ✅ Mostramos 0 SOL en lugar de "--"
      }
    };

    updateWalletStatus();
  }, [walletAddress]);

  const handleConnect = () => {
    if (!walletAddress) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        {isAuthenticated ? `${balance ? balance.toFixed(2) : "0.00"} SOL` : "Connect Wallet"}
      </button>

      <button
        className="menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
        disabled={!isReady}
      >
        <span className="menu-icon"></span>
      </button>

      <WalletMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        walletStatus={walletStatus}
        handleLogout={() => {
          disconnectWallet();
          logout();
          setIsModalOpen(true);
        }}
      />

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default WalletButton;
