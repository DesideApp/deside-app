import React, { useState, useEffect, memo } from "react";
import {
  detectWallet,
  handleWalletSelected,
  handleLogoutClick,
  getWalletState,
} from "../../services/walletStateService.js";
import { getWalletBalance } from "../../services/walletBalanceService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState(getWalletState());
  const [balance, setBalance] = useState(null);

  // Detectar wallet automáticamente al montar
  useEffect(() => {
    const initializeWallet = async () => {
      const state = await detectWallet();
      setWalletState(state);

      if (state.pubkey) {
        const balance = await getWalletBalance(state.pubkey);
        setBalance(balance);
      }
    };

    initializeWallet();
  }, []);

  // 🌐 Escucha eventos globales para abrir el modal
  useEffect(() => {
    const handleOpenWalletModal = () => {
      console.log("🌐 Evento recibido: openWalletModal → Abriendo WalletModal...");
      setIsModalOpen(true);
    };

    window.addEventListener("openWalletModal", handleOpenWalletModal);
    return () => {
      window.removeEventListener("openWalletModal", handleOpenWalletModal);
    };
  }, []);

  // Evento de clic en "Connect Wallet"
  const handleConnectClick = () => {
    if (!walletState.pubkey) {
      setIsModalOpen(true);
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  };

  // Seleccionar wallet desde modal
  const handleWalletSelection = async (walletType) => {
    const result = await handleWalletSelected(walletType);
    setWalletState(result);

    if (result.pubkey) {
      const balance = await getWalletBalance(result.pubkey);
      setBalance(balance);
    } else {
      setBalance(null);
    }

    setIsModalOpen(false);
  };

  // Logout manual
  const logout = async () => {
    await handleLogoutClick();
    setWalletState({ pubkey: null });
    setBalance(null);
    setIsMenuOpen(false);
  };

  const formattedBalance = walletState.pubkey
    ? typeof balance === "number"
      ? `${balance.toFixed(2)} SOL`
      : `${walletState.pubkey.slice(0, 5)}...`
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      <div className="wallet-button-wrapper">
        <button className="wallet-button" onClick={handleConnectClick}>
          <span>{formattedBalance}</span>
        </button>
      </div>

      <div className="menu-button-wrapper">
        <button
          className="menu-button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle Wallet Menu"
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      <WalletMenu
        isOpen={isMenuOpen}
        handleLogout={logout}
        onClose={() => setIsMenuOpen(false)}
        walletAddress={walletState.pubkey}
        balance={balance}
        openWalletModal={() => setIsModalOpen(true)}
      />

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelected={handleWalletSelection}
      />
    </div>
  );
});

export default WalletButton;
