import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaHelpers.js";
import { disconnectWallet } from "../../services/walletService.js";
import { checkAuthStatus, logout } from "../../services/apiService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletStatus, walletAddress, isReady, syncWalletStatus } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isReady || !walletAddress) return;

    const abortController = new AbortController();

    const updateWalletStatus = async () => {
      try {
        const status = await checkAuthStatus();
        if (!abortController.signal.aborted) {
          setIsAuthenticated(status.isAuthenticated);
          setBalance(status.isAuthenticated ? await getBalance(walletAddress) : null);
        }
      } catch (error) {
        console.error("❌ Error verificando la wallet:", error);
        if (!abortController.signal.aborted) {
          setIsAuthenticated(false);
          setBalance(null);
        }
      }
    };

    updateWalletStatus();
    return () => abortController.abort();
  }, [walletAddress, isReady]);

  // ✅ **Abrir el modal al intentar conectar la wallet**
  const handleConnect = useCallback(() => {
    console.log("🔵 Intentando abrir el modal...");
    setIsModalOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    disconnectWallet();
    logout();
    setIsAuthenticated(false);
    setBalance(null);
    setIsModalOpen(true);
  }, []);

  // ✅ **Cuando el modal se cierra, revalida el estado de la wallet**
  const handleModalClose = useCallback(() => {
    console.log("🔴 Cierre del modal detectado. Revalidando estado de la wallet...");
    setIsModalOpen(false);
    syncWalletStatus(); // 🔄 Revalidar autenticación tras el cierre del modal.
  }, [syncWalletStatus]);

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

      <WalletMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} handleLogout={handleLogout} />

      <WalletModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
});

export default WalletButton;
