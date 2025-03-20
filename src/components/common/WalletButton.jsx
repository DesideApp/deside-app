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

  // Detectar automáticamente la wallet al montar el componente
  useEffect(() => {
    detectWallet().then((state) => setWalletState(state));
  }, []);

  // Manejar clic en el botón "Connect Wallet"
  const handleConnectClick = () => {
    if (!walletState.pubkey) {
      console.log("[WalletButton] 🔍 No hay wallet conectada. Abriendo modal...");
      setIsModalOpen(true);
    } else {
      console.log("[WalletButton] 🔍 Wallet conectada. Abriendo menú...");
      setIsMenuOpen((prev) => !prev);
    }
  };

  // Manejar selección de wallet desde el modal
  const handleWalletSelection = async (walletType) => {
    console.log(`[WalletButton] 🔍 Wallet seleccionada: ${walletType}`);
    if (!walletType) {
      console.error("[WalletButton] ❌ Tipo de wallet no definido.");
      return;
    }
    const result = await handleWalletSelected(walletType);
    setWalletState(result);
    setIsModalOpen(false);
  };

  // Manejar cierre de sesión
  const logout = async () => {
    console.log("[WalletButton] 🔍 Cerrando sesión...");
    await handleLogoutClick();
    setWalletState({ pubkey: null, balance: null });
    setIsMenuOpen(false);
  };

  // Formatear el texto del botón
  const formattedBalance = walletState.pubkey
    ? walletState.balance !== null && !isNaN(walletState.balance)
      ? `${walletState.balance.toFixed(2)} SOL`
      : "-- SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* 🔹 Botón "Connect Wallet" */}
      <div className="wallet-button-wrapper">
        <button className="wallet-button" onClick={handleConnectClick}>
          <span>{formattedBalance}</span>
        </button>
      </div>

      {/* 🔹 Botón hamburguesa */}
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

      {/* ✅ Menú de wallet */}
      <WalletMenu
        isOpen={isMenuOpen}
        handleLogout={logout}
        onClose={() => setIsMenuOpen(false)}
        walletAddress={walletState.pubkey}
        balance={walletState.balance}
        openWalletModal={() => setIsModalOpen(true)}
      />

      {/* ✅ Modal de selección de wallet */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWalletSelected={handleWalletSelection}
      />
    </div>
  );
});

export default WalletButton;
