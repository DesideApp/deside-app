import React, { useState, useEffect, useCallback, memo } from "react";
import { getWalletBalance, getConnectedWallet, connectWallet, handleLogout } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  /** 🔹 **Actualizar saldo** */
  const updateBalance = useCallback(async () => {
    const { walletAddress, selectedWallet } = await getConnectedWallet();
    if (!walletAddress || !selectedWallet) return setBalance(null);

    try {
      const walletBalance = await getWalletBalance(walletAddress, selectedWallet);
      setBalance(walletBalance);
    } catch {
      setBalance(0);
    }
  }, []);

  /** 🔹 **Detectar conexión automática** */
  useEffect(() => {
    const detectWallet = async () => {
      const { walletAddress } = await getConnectedWallet();
      setWalletAddress(walletAddress || null);
      if (walletAddress) await updateBalance();
      setIsCheckingWallet(false);
    };

    detectWallet();
  }, [updateBalance]);

  /**
   * 🔹 **Si no hay wallet, abrir modal. Si sí hay, toggle del menú**
   */
  const handleConnectClick = useCallback(() => {
    if (!walletAddress) {
      setIsModalOpen(true);
    } else {
      setIsMenuOpen((prev) => !prev);
    }
  }, [walletAddress]);

  /** 🔹 **Abrir/Cerrar menú con la hamburguesa** */
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  /** 🔹 **Cerrar modal** */
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  /** 🔹 **Conectar wallet desde el modal** */
  const handleWalletSelected = useCallback(async (wallet) => {
    const result = await connectWallet(wallet);
    if (result.pubkey) {
      setWalletAddress(result.pubkey);
      await updateBalance();
      handleCloseModal();
    }
  }, [handleCloseModal, updateBalance]);

  /** 🔹 **Eventos de walletConnected/walletDisconnected** */
  useEffect(() => {
    const handleWalletConnected = async (event) => {
      const { pubkey } = event.detail;
      setWalletAddress(pubkey);
      await updateBalance();
    };

    const handleWalletDisconnected = () => {
      setWalletAddress(null);
      setBalance(null);
      setIsMenuOpen(false);
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, [updateBalance]);

  /** 🔹 **Cerrar sesión** */
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
        <button className="wallet-button" onClick={handleConnectClick} disabled={isCheckingWallet}>
          <span>{formattedBalance}</span>
        </button>
      </div>

      {/* 🔹 Botón hamburguesa */}
      <div className="menu-button-wrapper">
        <button className="menu-button" onClick={toggleMenu} aria-label="Toggle Wallet Menu">
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
