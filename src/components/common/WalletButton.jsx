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

      setWalletAddress(walletAddress || null);
      if (walletAddress) {
        console.log(`✅ Wallet detectada automáticamente: ${walletAddress}`);
        await updateBalance(walletAddress);
      } else {
        console.warn("⚠️ No se detectó ninguna wallet conectada.");
        setBalance(null);
      }
      setIsCheckingWallet(false);
    };

    detectWallet();
  }, []);

  // ✅ **Actualizar saldo cuando cambia la wallet**
  useEffect(() => {
    if (walletAddress) updateBalance(walletAddress);
  }, [walletAddress]);

  const updateBalance = async (address) => {
    try {
      const walletBalance = address ? await getWalletBalance(address) : null;
      setBalance(walletBalance);
      console.log(`✅ Balance actualizado: ${walletBalance !== null ? walletBalance + " SOL" : "No disponible"}`);
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

  // ✅ **Cerrar modal y menú**
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleCloseMenu = useCallback(() => setIsMenuOpen(false), []);

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

  // ✅ **Actualizar UI al detectar evento de conexión/desconexión**
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
      setIsMenuOpen(false);
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
    setIsMenuOpen(false);
  };

  // ✅ **Control de contenido del botón**
  const formattedBalance = walletAddress
    ? balance !== null
      ? `${balance.toFixed(2)} SOL`
      : "0.00 SOL"
    : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **Botón principal - Si wallet está conectada, abre el menú** */}
      <button className="wallet-button" onClick={handleWalletButtonClick} disabled={isCheckingWallet}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ **Icono de hamburguesa SIEMPRE visible y manejado desde WalletMenu** */}
      <WalletMenu 
        isOpen={isMenuOpen} 
        handleLogout={handleLogoutClick} 
        onClose={handleCloseMenu} 
        walletAddress={walletAddress} 
        balance={balance} 
      />

      {/* ✅ **Modal de conexión** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
