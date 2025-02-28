import React, { useState, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Usar el contexto global
import { getWalletBalance, disconnectWallet } from "../../services/walletService.js";
import { checkAuthStatus, logout } from "../../services/authServices.js"; // ✅ Validar autenticación con el backend
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
  const { walletStatus, walletAddress, isReady } = useWallet(); // ✅ Obtener datos desde el contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!isReady || !walletAddress) return;

    const updateWalletStatus = async () => {
      const status = await checkAuthStatus();
      setIsAuthenticated(status.isAuthenticated);

      if (status.isAuthenticated) {
        const walletBalance = await getWalletBalance(walletAddress);
        setBalance(walletBalance);
      } else {
        setBalance(null);
      }
    };

    updateWalletStatus();
  }, [isReady, walletAddress]);

  const handleConnect = () => {
    if (!walletAddress) {
      setIsModalOpen(true); // ✅ Se abre el modal solo si no hay wallet conectada
    }
  };

  const handleWalletSelect = async (walletType) => {
    console.log(`🔵 Seleccionando wallet: ${walletType}`);
    const status = await checkAuthStatus();

    if (status.isAuthenticated) {
      console.log("✅ Wallet conectada y autenticada.");
      setIsModalOpen(false);
    } else {
      console.warn("⚠️ No se pudo conectar o autenticar la wallet.");
    }
  };

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        {isAuthenticated
          ? `${balance ? balance.toFixed(2) : "--"} SOL`
          : "Connect Wallet"}
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

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelect={handleWalletSelect}
      />
    </div>
  );
}

export default WalletButton;
