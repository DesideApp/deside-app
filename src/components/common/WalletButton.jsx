import React, { useState, useEffect, memo } from "react";
import {
  detectWallet,
  handleWalletSelected,
  handleLogoutClick,
  getWalletState,
} from "../../services/walletStateService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletState, setWalletState] = useState(getWalletState());

  // Detectar wallet automáticamente al montar
  useEffect(() => {
    const initializeWallet = async () => {
      const state = await detectWallet();
      setWalletState(state);
    };
    initializeWallet();
  }, []);

  // Evento de clic en "Connect Wallet"
  const handleConnectClick = () => {
    if (!walletState.pubkey) {
      setIsModalOpen(true);
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  };

  // Seleccionar wallet desde modal (sin lógica de negocio aquí)
  const handleWalletSelection = async (walletType) => {
    const result = await handleWalletSelected(walletType);
    setWalletState(result);
    setIsModalOpen(false);
  };

  // Manejar cierre de sesión (llama al servicio)
  const logout = async () => {
    await handleLogoutClick();
    setWalletState({ pubkey: null, balance: null });
    setIsMenuOpen(false);
  };

  // Formato visual del botón
  const formattedBalance = walletState.pubkey
    ? walletState.balance !== null && !isNaN(walletState.balance)
      ? `${walletState.balance.toFixed(2)} SOL`
      : "-- SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* Botón de conexión (sin lógica directa) */}
      <div className="wallet-button-wrapper">
        <button className="wallet-button" onClick={handleConnectClick}>
          <span>{formattedBalance}</span>
        </button>
      </div>

      {/* Botón hamburguesa para menú */}
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

      {/* Menú de wallet (solo visual y eventos locales) */}
      <WalletMenu
        isOpen={isMenuOpen}
        handleLogout={logout}
        onClose={() => setIsMenuOpen(false)}
        walletAddress={walletState.pubkey}
        balance={walletState.balance}
        openWalletModal={() => setIsModalOpen(true)}
      />

      {/* Modal de selección de wallet (sin lógica específica aquí) */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelected={handleWalletSelection}
      />
    </div>
  );
});

export default WalletButton;
