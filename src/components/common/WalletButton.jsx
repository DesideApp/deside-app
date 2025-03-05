import React, { useState, useEffect, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaDirect.js"; // ✅ Obtener balance directamente
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletAddress, isReady } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ **Actualizar saldo cuando cambia la wallet**
  useEffect(() => {
    if (!walletAddress) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const walletBalance = await getBalance(walletAddress);
        setBalance(walletBalance);
      } catch (error) {
        console.error("❌ Error obteniendo balance:", error);
        setBalance(null);
      }
    };

    fetchBalance();
  }, [walletAddress]);

  // ✅ **Abrir modal al hacer clic en el botón**
  const handleConnect = () => {
    console.log("🔵 Abriendo modal de conexión...");
    setIsModalOpen(true);
  };

  // ✅ **Cerrar modal**
  const handleCloseModal = () => {
    console.log("🔴 Cerrando modal...");
    setIsModalOpen(false);
  };

  const formattedBalance = balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet";

  return (
    <div className="wallet-container">
      {/* ✅ **SIEMPRE visible y permite abrir el modal sin importar estado** */}
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ **WalletMenu sigue funcionando de forma independiente** */}
      <WalletMenu />

      {/* ✅ **Modal de conexión TOTALMENTE CONTROLADO desde aquí** */}
      <WalletModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
});

export default WalletButton;
