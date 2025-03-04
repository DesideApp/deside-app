import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaHelpers.js";
import { disconnectWallet } from "../../services/walletService.js";
import { checkAuthStatus, logout } from "../../services/apiService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletStatus, walletAddress, isReady } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isReady || !walletAddress) return;

    let isMounted = true;

    const updateWalletStatus = async () => {
      try {
        const status = await checkAuthStatus();
        if (isMounted) {
          setIsAuthenticated(status.isAuthenticated);
          setBalance(status.isAuthenticated ? await getBalance(walletAddress) : null);
        }
      } catch (error) {
        console.error("❌ Error verificando la wallet:", error);
        if (isMounted) {
          setIsAuthenticated(false);
          setBalance(null);
        }
      }
    };

    updateWalletStatus();

    return () => { isMounted = false; };
  }, [walletAddress, isReady]);

  const handleConnect = useCallback(() => {
    if (!walletAddress) setIsModalOpen(true);
  }, [walletAddress]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet"),
    [balance]
  );

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        <span aria-live="polite">{isAuthenticated ? formattedBalance : "Connect Wallet"}</span>
      </button>

      <button
        className="menu-button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
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
});

export default WalletButton;
