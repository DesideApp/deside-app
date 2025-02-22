import React, { useState, useEffect, useContext } from "react";
import { WalletContext } from "../../contexts/WalletContext.jsx"; // Importar el contexto
import { disconnectWallet, getWalletBalance } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
  const { walletStatus, setWalletStatus } = useContext(WalletContext); // Usar el contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateWalletStatus = async () => {
      const { state, walletAddress } = await ensureWalletState();

      if (state === "AUTENTICADO Y SI") {
        const balance = await getWalletBalance(walletAddress);
        setWalletStatus({ walletAddress, isAuthenticated: true, balance });
      } else {
        setWalletStatus({ walletAddress: null, isAuthenticated: false, balance: null });
      }
    };

    updateWalletStatus();

    const handleWalletConnected = async (e) => {
      const balance = await getWalletBalance(e.detail.wallet);
      setWalletStatus({ walletAddress: e.detail.wallet, isAuthenticated: true, balance });
      setIsModalOpen(false);
    };

    const handleWalletDisconnected = () => {
      setWalletStatus({ walletAddress: null, isAuthenticated: false, balance: null });
    };

    if (window.solana) {
      window.solana.on("connect", updateWalletStatus);
      window.solana.on("disconnect", handleWalletDisconnected);
      window.solana.on("accountChanged", updateWalletStatus);
    }

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      if (window.solana) {
        window.solana.off("connect", updateWalletStatus);
        window.solana.off("disconnect", handleWalletDisconnected);
        window.solana.off("accountChanged", updateWalletStatus);
      }

      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, [setWalletStatus]);

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const handleWalletSelect = async (walletType) => {
    console.log(`🔵 Seleccionando wallet: ${walletType}`);

    const { state } = await ensureWalletState();

    if (state === "AUTENTICADO Y SI") {
      console.log("✅ Wallet conectada y autenticada.");
      setIsModalOpen(false);
    } else {
      console.warn("⚠️ No se pudo conectar o autenticar la wallet.");
    }
  };

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleConnect}>
        {walletStatus.walletAddress
          ? `${walletStatus.balance ? walletStatus.balance.toFixed(2) : "--"} SOL`
          : "Connect Wallet"}
      </button>

      <button
        className="menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Menu"
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
          setWalletStatus({ walletAddress: null, isAuthenticated: false, balance: null });
          setIsModalOpen(true);
        }}
      />

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onWalletSelect={handleWalletSelect} />
    </div>
  );
}

export default WalletButton;
