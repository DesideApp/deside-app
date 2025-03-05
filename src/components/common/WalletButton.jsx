import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaDirect.js";
import { handleWalletConnected, handleLogout } from "../../services/walletService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletStatus, walletAddress, isReady, syncWalletStatus } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ **Actualizar saldo cuando cambia la conexión**
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

  // ✅ **Abrir modal SIEMPRE cuando se hace clic**
  const handleConnect = useCallback(() => {
    console.log("🔵 Abriendo modal de conexión...");
    setIsModalOpen(true);
  }, []);

  // ✅ **Cerrar modal de forma segura**
  const handleCloseModal = useCallback(() => {
    console.log("🔴 Cerrando modal...");
    setIsModalOpen(false);
  }, []);

  // ✅ **Manejar conexión de wallet**
  const handleModalWalletConnected = useCallback(async (wallet) => {
    console.log("✅ Wallet conectada. Autenticando...");
    const { walletStatus } = await handleWalletConnected(wallet, syncWalletStatus);

    if (walletStatus === "authenticated") {
      console.log("✅ Autenticación exitosa.");
      handleCloseModal();
    } else {
      console.warn("⚠️ No se pudo autenticar la wallet.");
    }
  }, [syncWalletStatus, handleCloseModal]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet"),
    [balance]
  );

  return (
    <div className="wallet-container">
      {/* ✅ SIEMPRE SE VE - Permite abrir el modal sin importar el estado */}
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        <span>{formattedBalance}</span>
      </button>

      {/* ✅ WalletMenu sigue funcionando de forma independiente */}
      <WalletMenu handleLogout={handleLogout} />

      {/* ✅ Modal de conexión totalmente controlado */}
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onWalletConnected={handleModalWalletConnected} 
      />
    </div>
  );
});

export default WalletButton;
