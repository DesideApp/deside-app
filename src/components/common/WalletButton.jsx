import React, { useState, useEffect, useCallback, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getWalletBalance } from "../../utils/solanaDirect.js";
import { connectWallet, getConnectedWallet, handleLogout } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletAddress, isReady } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // ✅ **Detectar conexión automática de wallet**
  useEffect(() => {
    const detectWallet = async () => {
      console.log("🔄 Revisando conexión automática...");
      const { walletAddress, walletStatus, selectedWallet } = await getConnectedWallet();

      if (walletAddress) {
        console.log(`✅ Wallet detectada: ${selectedWallet} (${walletAddress})`);
        setSelectedWallet(selectedWallet);
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

  // ✅ **Abrir modal al hacer clic en el botón**
  const handleConnect = useCallback(() => {
    console.log("🔵 Abriendo modal de conexión...");
    setIsModalOpen(true);
  }, []);

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
      updateBalance(result.pubkey);
      handleCloseModal();
    } else {
      console.warn("⚠️ Error conectando wallet:", result.error);
    }
  }, [handleCloseModal]);

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **SIEMPRE visible y permite abrir el modal sin importar estado** */}
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ **WalletMenu sigue funcionando de forma independiente** */}
      <WalletMenu handleLogout={handleLogout} />

      {/* ✅ **Modal de conexión TOTALMENTE CONTROLADO desde aquí** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} onWalletSelected={handleWalletSelected} />
    </div>
  );
});

export default WalletButton;
