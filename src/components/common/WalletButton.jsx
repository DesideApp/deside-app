import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaHelpers.js";
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

  // ✅ **Abrir el modal solo si NO estamos autenticados**
  const handleConnect = useCallback(() => {
    if (walletStatus === "not_connected" || walletStatus === "connected") {
      console.log("🔵 Intentando abrir el modal...");
      setIsModalOpen(true);
    } else {
      console.warn("⚠️ Ya estamos autenticados.");
    }
  }, [walletStatus]);

  // ✅ **Cuando el modal se cierra, verificar estado de la wallet**
  const handleModalWalletConnected = useCallback(async (wallet) => {
    console.log("✅ Wallet conectada. Autenticando...");
    const { walletStatus } = await handleWalletConnected(wallet, syncWalletStatus);
    
    if (walletStatus === "authenticated") {
      console.log("✅ Autenticación exitosa.");
      setIsModalOpen(false);
    } else {
      console.warn("⚠️ No se pudo autenticar la wallet.");
    }
  }, [syncWalletStatus]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet"),
    [balance]
  );

  return (
    <div className="wallet-container">
      {/* ✅ Solo mostramos "Connect Wallet" si NO está autenticada */}
      {(walletStatus === "not_connected" || walletStatus === "connected") && (
        <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
          <span aria-live="polite">Connect Wallet</span>
        </button>
      )}

      {/* ✅ WalletMenu ahora solo invoca handleLogout directamente */}
      <WalletMenu handleLogout={handleLogout} />

      {/* ✅ Modal de conexión */}
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onWalletConnected={handleModalWalletConnected} 
      />
    </div>
  );
});

export default WalletButton;
