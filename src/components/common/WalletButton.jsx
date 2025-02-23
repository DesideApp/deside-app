import React, { useState, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Usar el contexto global
import { ensureWalletState } from "../../services/walletStateService.js";
import { disconnectWallet, getWalletBalance } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
  const { walletStatus, walletAddress, isReady } = useWallet(); // ✅ Obtener datos desde el contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ Evitar ejecutar lógica antes de que el contexto esté listo
  if (!isReady) {
    return <p>Cargando datos de la wallet...</p>;
  }

  useEffect(() => {
    const updateWalletStatus = async () => {
      const { state, walletAddress } = await ensureWalletState();

      if (state === "AUTENTICADO Y SI") {
        const walletBalance = await getWalletBalance(walletAddress);
        setBalance(walletBalance);
      } else {
        setBalance(null);
      }
    };

    updateWalletStatus();

    const handleWalletConnected = async (e) => {
      const walletBalance = await getWalletBalance(e.detail.wallet);
      setBalance(walletBalance);
      setIsModalOpen(false);
    };

    const handleWalletDisconnected = () => {
      setBalance(null);
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
  }, []);

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
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        {walletAddress
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
