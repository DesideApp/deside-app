import React, { useState, useEffect, useCallback, memo } from "react";
import { connectWallet, handleLogout, getWalletBalance } from "../../services/walletService.js";
import { isPhantomConnected } from "../../services/walletProviders.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  /**
   * 🔹 **Detectar conexión y actualizar balance automáticamente**
   */
  const detectWallet = useCallback(async () => {
    const connectedWallet = isPhantomConnected();
    if (connectedWallet) {
      setWalletAddress(connectedWallet.pubkey);
      setBalance(await getWalletBalance());
    } else {
      setWalletAddress(null);
      setBalance(null);
    }
  }, []);

  useEffect(() => {
    detectWallet();
  }, [detectWallet]);

  /**
   * 🔹 **Abrir modal si no hay wallet conectada, sino abrir el menú**
   */
  const handleConnectClick = useCallback(() => {
    if (!walletAddress) {
      setIsModalOpen(true);
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  }, [walletAddress]);

  /** 🔹 **Cerrar modal** */
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  /** 🔹 **Conectar wallet desde el modal** */
  const handleWalletSelected = useCallback(async () => {
    try {
      const result = await connectWallet();
      if (result.pubkey) {
        await detectWallet();
      }
      handleCloseModal();
    } catch (error) {
      console.error("❌ Error al conectar Phantom:", error.message);
    }
  }, [detectWallet, handleCloseModal]);

  /** 🔹 **Cerrar sesión correctamente** */
  const handleLogoutClick = async () => {
    await handleLogout();
    setWalletAddress(null);
    setBalance(null);
    setIsMenuOpen(false);
  };

  /** 🔹 **Texto del botón** */
  const formattedBalance = walletAddress
    ? balance !== null && !isNaN(balance)
      ? `${balance.toFixed(2)} SOL`
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
        <button className="menu-button" onClick={() => setIsMenuOpen((prev) => !prev)} aria-label="Toggle Wallet Menu">
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
        handleLogout={handleLogoutClick}
        onClose={() => setIsMenuOpen(false)}
        walletAddress={walletAddress}
        balance={balance}
        openWalletModal={() => setIsModalOpen(true)}
      />

      {/* ✅ Modal de selección de wallet */}
      <WalletModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onWalletSelected={handleWalletSelected}
      />
    </div>
  );
});

export default WalletButton;
