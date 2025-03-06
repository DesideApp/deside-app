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
   * 🔹 **Actualizar saldo de la wallet** (Usa `getWalletBalance()` desde `walletService.js`)
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
   * 🔹 **Detectar conexión automática al abrir la app**
   */
  useEffect(() => {
    const detectWallet = async () => {
      const { walletAddress } = await getConnectedWallet();
      setWalletAddress(walletAddress || null);
      if (walletAddress) await updateBalance(); // ✅ `updateBalance()` ya obtiene `walletAddress`
      setIsCheckingWallet(false); // ✅ Habilitar el botón después de la detección
    };

    detectWallet();
  }, [updateBalance]);

  /**
   * 🔹 **Manejar clic en el botón (abrir modal o menú)**
   */
  const handleWalletButtonClick = useCallback(() => {
    if (isCheckingWallet) return; // ✅ No hacer nada si aún se está verificando
    walletAddress ? setIsMenuOpen((prev) => !prev) : setIsModalOpen(true);
  }, [walletAddress, isCheckingWallet]);

  /**
   * 🔹 **Cerrar modal y menú**
   */
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

  /**
   * 🔹 **Conectar wallet desde el modal**
   * @param {string} wallet - Nombre del proveedor seleccionado
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
   * 🔹 **Actualizar UI al detectar eventos de conexión/desconexión**
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
   * 🔹 **Logout (desconectar Web3 o cerrar sesión en backend)**
   */
  const handleLogoutClick = async () => {
    const isAuthenticated = document.cookie.includes("accessToken"); // ✅ Detecta si hay sesión en backend

    if (isAuthenticated) {
      await handleLogout(() => setWalletAddress(null)); // ✅ Cierra sesión en el backend
    } else {
      await disconnectWallet(); // ✅ Solo desconecta Web3 si no hay sesión en backend
    }

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
      {/* ✅ Botón principal que abre menú o modal */}
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ Menú de wallet (si está conectado) */}
      <WalletMenu 
        isOpen={isMenuOpen} 
        handleLogout={handleLogoutClick} 
        onClose={handleCloseMenu} 
        walletAddress={walletAddress} 
        balance={balance} 
      />

      {/* ✅ Modal para seleccionar wallet (si no está conectado) */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
