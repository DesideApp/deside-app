import React, { useState, useEffect, useCallback, memo } from "react";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import { connectWallet, getConnectedWallet, disconnectWallet } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCheckingWallet, setIsCheckingWallet] = useState(true); // 🔄 Nueva bandera para evitar estados incorrectos

  // ✅ **Detectar conexión automática de wallet SIN abrir modal**
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
      }
      setIsCheckingWallet(false); // ✅ Finalizar chequeo inicial
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
      setBalance(null);
    }
  };

  // ✅ **Abrir modal SOLO si NO hay una wallet conectada y ya terminó el chequeo inicial**
  const handleConnect = useCallback(() => {
    if (walletAddress || isCheckingWallet) {
      console.log("✅ Wallet ya conectada o en proceso de verificación, no se abre el modal.");
      return;
    }
    console.log("🔵 Abriendo modal de conexión...");
    setIsModalOpen(true);
  }, [walletAddress, isCheckingWallet]);

  // ✅ **Cerrar modal**
  const handleCloseModal = useCallback(() => {
    console.log("🔴 Cerrando modal...");
    setIsModalOpen(false);
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
    const handleWalletConnected = async (event) => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { wallet, pubkey } = event.detail;

      console.log(`✅ Wallet conectada: ${wallet} (${pubkey})`);
      setSelectedWallet(wallet);
      setWalletAddress(pubkey);
      updateBalance(pubkey);
    };

    const handleWalletDisconnected = () => {
      console.warn("❌ Wallet desconectada.");
      setWalletAddress(null);
      setSelectedWallet(null);
      setBalance(null);
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
    await disconnectWallet(); // 🔄 Llamar al servicio de desconexión
    setWalletAddress(null);
    setSelectedWallet(null);
    setBalance(null);
  };

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **Si ya hay wallet conectada, muestra el balance directamente** */}
      <button className="wallet-button" onClick={handleConnect} disabled={isCheckingWallet}>
        <span>{walletAddress ? formattedBalance : "Connect Wallet"}</span>
      </button>

      {/* ✅ **WalletMenu sigue funcionando de forma independiente** */}
      <WalletMenu handleLogout={handleLogoutClick} />

      {/* ✅ **Modal de conexión TOTALMENTE CONTROLADO desde aquí** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
