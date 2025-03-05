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
      }
    };

    detectWallet();
  }, []);

  // ✅ **Actualizar saldo cuando cambia la wallet**
  const updateBalance = async (address) => {
    try {
      if (!address) {
        setBalance(null);
        return;
      }

      const walletBalance = await getWalletBalance(address);
      setBalance(walletBalance);
    } catch (error) {
      console.error("❌ Error obteniendo balance:", error);
      setBalance(null);
    }
  };

  // ✅ **Abrir modal SOLO si NO hay una wallet conectada**
  const handleConnect = useCallback(() => {
    if (walletAddress) {
      console.log("✅ Wallet ya conectada, no se abre el modal.");
      return;
    }
    console.log("🔵 Abriendo modal de conexión...");
    setIsModalOpen(true);
  }, [walletAddress]);

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
    const handleWalletEvent = async () => {
      console.log("🔄 Evento walletConnected detectado. Verificando estado...");
      const { walletAddress, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet ahora conectada: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
        setWalletAddress(walletAddress);
        updateBalance(walletAddress);
      }
    };

    window.addEventListener("walletConnected", handleWalletEvent);
    return () => window.removeEventListener("walletConnected", handleWalletEvent);
  }, []);

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **Si ya hay wallet conectada, muestra el balance directamente** */}
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
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
