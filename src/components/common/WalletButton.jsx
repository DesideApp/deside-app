import React, { useState, useEffect, useCallback, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import { connectWallet, getConnectedWallet, handleLogout } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { isReady } = useWallet();
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
        setIsCheckingWallet(false); // ✅ Finalizar chequeo inicial
      } else {
        console.warn("⚠️ No se detectó ninguna wallet conectada.");
        setIsCheckingWallet(false); // ✅ Finalizar chequeo inicial aunque no haya wallet
      }
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
    } else {
      console.warn("⚠️ Error conectando wallet:", result.error);
    }
  }, [handleCloseModal]);

  // ✅ **Actualizar UI al detectar evento de conexión de wallet**
  useEffect(() => {
    const handleWalletEvent = async () => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet ahora conectada: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
        setWalletAddress(walletAddress);
      }
    };

    window.addEventListener("walletConnected", handleWalletEvent);
    return () => window.removeEventListener("walletConnected", handleWalletEvent);
  }, []);

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **Si ya hay wallet conectada, muestra el balance directamente** */}
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady || isCheckingWallet}>
        <span>{walletAddress ? formattedBalance : "Connect Wallet"}</span>
      </button>

      {/* ✅ **WalletMenu sigue funcionando de forma independiente** */}
      <WalletMenu handleLogout={handleLogout} />

      {/* ✅ **Modal de conexión TOTALMENTE CONTROLADO desde aquí** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
