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

  // ✅ **Detectar conexión automática SIN abrir modal**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada automáticamente: ${walletAddress}`);
        setWalletAddress(walletAddress);
        await updateBalance(walletAddress);
      } else {
        console.warn("⚠️ No se detectó ninguna wallet conectada.");
        setWalletAddress(null);
        setBalance(null);
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
        setBalance(null);
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
      console.log("✅ Wallet ya conectada, abriendo/cerrando WalletMenu...");
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
      setWalletAddress(result.pubkey);
      await updateBalance(result.pubkey);
      handleCloseModal();
    } else {
      console.warn("⚠️ Error conectando wallet:", result.error);
    }
  }, [handleCloseModal]);

  // ✅ **Actualizar UI al detectar evento de conexión de wallet**
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔄 Evento walletConnected detectado...");
      const { walletAddress } = await getConnectedWallet();
      setWalletAddress(walletAddress);
      await updateBalance(walletAddress);
    };

    const handleWalletDisconnected = () => {
      console.warn("❌ Wallet desconectada.");
      setWalletAddress(null);
      setBalance(null);
      setIsMenuOpen(false); // 🔄 Cerrar WalletMenu si la wallet se desconecta
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
    setBalance(null);
    setIsMenuOpen(false); // 🔄 Cerrar WalletMenu al desconectar
  };

  // ✅ **Abrir WalletMenu desde el icono de la hamburguesa**
  const handleMenuIconClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // ✅ **Control de contenido del botón**
  const formattedBalance = walletAddress
    ? balance !== null
      ? `${balance.toFixed(2)} SOL`
      : "0.00 SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **Botón principal que maneja conexión y menú** */}
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ **Icono de hamburguesa SIEMPRE visible** */}
      <button className="menu-button" onClick={handleMenuIconClick} aria-label="Open Wallet Menu">
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* ✅ **WalletMenu siempre montado, pero solo se muestra si `isMenuOpen` es `true`** */}
      <WalletMenu isOpen={isMenuOpen} handleLogout={handleLogoutClick} onClose={handleCloseMenu} />

      {/* ✅ **Modal de conexión** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
