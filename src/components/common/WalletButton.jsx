import React, { useState, useEffect, useCallback, memo } from "react";
import { getWalletBalance, getConnectedWallet, connectWallet, disconnectWallet, handleLogout } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  /**
   * 🔹 **Actualizar saldo de la wallet**
   */
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

  /**
   * 🔹 **Detectar conexión automática**
   */
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
   * 🔹 **Abrir menú o modal según el estado de la wallet**
   */
  const handleWalletButtonClick = useCallback(() => {
    if (isCheckingWallet) return;
    walletAddress ? setIsMenuOpen((prev) => !prev) : setIsModalOpen(true);
  }, [walletAddress, isCheckingWallet]);

  /**
   * 🔹 **Cerrar modal y menú**
   */
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

  /**
   * 🔹 **Conectar wallet desde el modal**
   */
  const handleWalletSelected = useCallback(async (wallet) => {
    const result = await connectWallet(wallet);
    if (result.pubkey) {
      setWalletAddress(result.pubkey);
      await updateBalance();
      handleCloseModal();
    }
  }, [handleCloseModal, updateBalance]);

  /**
   * 🔹 **Detectar eventos de conexión/desconexión**
   */
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

  /**
   * 🔹 **Cerrar sesión completamente**
   */
  const handleLogoutClick = async () => {
    await handleLogout(() => setWalletAddress(null));
    setWalletAddress(null);
    setBalance(null);
    setIsMenuOpen(false);
  };

  /**
   * 🔹 **Definir contenido del botón**
   */
  const formattedBalance = walletAddress
    ? balance !== null && !isNaN(balance)
      ? `${balance.toFixed(2)} SOL`
      : "0.00 SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ Botón principal */}
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ Botón hamburguesa */}
      {walletAddress && (
        <button className={`menu-button ${isMenuOpen ? "open" : ""}`} onClick={handleWalletButtonClick} aria-label="Toggle Wallet Menu">
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      )}

      {/* ✅ Menú de wallet */}
      <WalletMenu 
        isOpen={isMenuOpen} 
        handleLogout={handleLogoutClick} 
        onClose={handleCloseMenu} 
        walletAddress={walletAddress} 
        balance={balance} 
      />

      {/* ✅ Modal para seleccionar wallet */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
