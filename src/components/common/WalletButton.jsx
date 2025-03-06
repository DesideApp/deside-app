import React, { useState, useEffect, useCallback, memo } from "react";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import { connectWallet, getConnectedWallet, disconnectWallet } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  // ✅ **Actualizar saldo evitando renders innecesarios**
  const updateBalance = useCallback(async (address) => {
    if (!address) return setBalance(null);
    try {
      const walletBalance = await getWalletBalance(address);
      setBalance(walletBalance);
    } catch {
      setBalance(0);
    }
  }, []);

  // ✅ **Detectar conexión automática SIN abrir modal**
  useEffect(() => {
    const detectWallet = async () => {
      const { walletAddress } = await getConnectedWallet();
      setWalletAddress(walletAddress || null);
      if (walletAddress) updateBalance(walletAddress);
      setIsCheckingWallet(false);
    };

    detectWallet();
  }, [updateBalance]);

  // ✅ **Abrir WalletMenu si ya está conectada, Modal si no lo está**
  const handleWalletButtonClick = useCallback(() => {
    walletAddress ? setIsMenuOpen((prev) => !prev) : setIsModalOpen(true);
  }, [walletAddress]);

  // ✅ **Cerrar modal y menú**
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

  // ✅ **Conectar wallet desde el modal**
  const handleWalletSelected = useCallback(async (wallet) => {
    const result = await connectWallet(wallet);
    if (result.pubkey) {
      setWalletAddress(result.pubkey);
      updateBalance(result.pubkey);
      handleCloseModal();
    }
  }, [handleCloseModal, updateBalance]);

  // ✅ **Actualizar UI al detectar evento de conexión/desconexión**
  useEffect(() => {
    const handleWalletConnected = (event) => {
      const { pubkey } = event.detail;
      setWalletAddress(pubkey);
      updateBalance(pubkey);
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

  // ✅ **Logout real**
  const handleLogoutClick = async () => {
    await disconnectWallet();
    setWalletAddress(null);
    setBalance(null);
    setIsMenuOpen(false);
  };

  // ✅ **Control de contenido del botón**
  const formattedBalance = walletAddress
    ? balance !== null && !isNaN(balance)
      ? `${balance.toFixed(2)} SOL`
      : "0.00 SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span>{formattedBalance}</span>
      </button>

      <WalletMenu 
        isOpen={isMenuOpen} 
        handleLogout={handleLogoutClick} 
        onClose={handleCloseMenu} 
        walletAddress={walletAddress} 
        balance={balance} 
      />

      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
