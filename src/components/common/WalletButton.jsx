import React, { useState, useEffect, useCallback, memo } from "react";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import { connectWallet, getConnectedWallet, disconnectWallet } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 🔹 Nuevo estado para WalletMenu
  const [balance, setBalance] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true);

  // ✅ **Detectar conexión automática SIN abrir modal**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada automáticamente: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
        setWalletAddress(walletAddress);
        updateBalance(walletAddress);
      } else {
        console.warn("⚠️ No se detectó ninguna wallet conectada.");
        setBalance(0);
      }
      setIsCheckingWallet(false);
    };

    detectWallet();
  }, []);

  // ✅ **Actualizar saldo cuando cambia la wallet**
  useEffect(() => {
    if (walletAddress) {
      console.log(`💰 Obteniendo saldo para ${walletAddress}...`);
      updateBalance(walletAddress);
    }
  }, [walletAddress]);

  const updateBalance = async (address) => {
    try {
      if (!address) {
        setBalance(0);
        return;
      }

      const walletBalance = await getWalletBalance(address);
      console.log(`✅ Balance actualizado: ${walletBalance} SOL`);
      setBalance(walletBalance);
    } catch (error) {
      console.error("❌ Error obteniendo balance:", error);
      setBalance(0);
    }
  };

  // ✅ **Abrir WalletMenu si ya está conectada, Modal si no lo está**
  const handleWalletButtonClick = useCallback(() => {
    if (walletAddress) {
      console.log("✅ Wallet ya conectada, abriendo WalletMenu...");
      setIsMenuOpen((prev) => !prev);
    } else {
      console.log("🔵 Abriendo modal de conexión...");
      setIsModalOpen(true);
    }
  }, [walletAddress]);

  // ✅ **Cerrar modal**
  const handleCloseModal = useCallback(() => {
    console.log("🔴 Cerrando modal...");
    setIsModalOpen(false);
  }, []);

  // ✅ **Cerrar WalletMenu**
  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // ✅ **Conectar wallet desde el modal**
  const handleWalletSelected = useCallback(async (wallet) => {
    console.log(`🔹 Intentando conectar con ${wallet}...`);
    const result = await connectWallet(wallet);

    if (result.status === "connected") {
      console.log("✅ Wallet conectada correctamente:", result.pubkey);
      setSelectedWallet(wallet);
      setWalletAddress(result.pubkey);
      updateBalance(result.pubkey);
      handleCloseModal();
    } else {
      console.warn("⚠️ Error conectando wallet:", result.error);
    }
  }, [handleCloseModal]);

  // ✅ **Actualizar UI al detectar evento de conexión de wallet**
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet ahora conectada: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
        setWalletAddress(walletAddress);
        updateBalance(walletAddress);
      }
    };

    const handleWalletDisconnected = () => {
      console.warn("❌ Wallet desconectada.");
      setWalletAddress(null);
      setSelectedWallet(null);
      setBalance(0);
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, []);

  // ✅ **Logout real**
  const handleLogoutClick = async () => {
    console.log("🚪 Cierre de sesión iniciado...");
    await disconnectWallet();
    setWalletAddress(null);
    setSelectedWallet(null);
    setBalance(0);
  };

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";
  const balanceStyle = balance === 0 ? { color: "gray" } : {};

  return (
    <div className="wallet-container">
      {/* ✅ **Si ya hay wallet conectada, abrir WalletMenu, si no abrir Modal** */}
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span style={balanceStyle}>{formattedBalance}</span>
      </button>

      {/* ✅ **WalletMenu ahora se abre desde WalletButton** */}
      {isMenuOpen && <WalletMenu handleLogout={handleLogoutClick} onClose={handleCloseMenu} />}

      {/* ✅ **Modal de conexión TOTALMENTE CONTROLADO desde aquí** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
