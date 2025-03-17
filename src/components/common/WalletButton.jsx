import React, { useState, useEffect, useCallback, memo } from "react";
import { connectWallet, handleLogout, getWalletBalance } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  /**
   * 🔹 **Actualizar balance al conectar wallet**
   */
  const updateBalance = useCallback(async (wallet) => {
    if (!wallet) return setBalance(null);
    const walletBalance = await getWalletBalance(wallet);
    setBalance(walletBalance);
  }, []);

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
  const handleWalletSelected = useCallback(async (wallet) => {
    const result = await connectWallet(wallet);
    if (result.pubkey) {
      setWalletAddress(result.pubkey);
      await updateBalance(result.pubkey);
    }
    handleCloseModal();
  }, [updateBalance, handleCloseModal]);

  /** 🔹 **Cerrar sesión correctamente** */
  const handleLogoutClick = async () => {
    await handleLogout(() => setWalletAddress(null));
    setWalletAddress(null);
    setBalance(null);
    setIsMenuOpen(false);
  };

  /** 🔹 **Texto del botón** */
  const formattedBalance = walletAddress
    ? balance !== null && !isNaN(balance)
      ? `${balance.toFixed(2)} SOL`
      : "0.00 SOL"
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
