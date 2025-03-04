import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { getBalance } from "../../utils/solanaHelpers.js";
import { disconnectWallet } from "../../services/walletService.js";
import { logout } from "../../services/apiService.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

const WalletButton = memo(() => {
  const { walletStatus, walletAddress, isReady, syncWalletStatus } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // ✅ **Abrir el modal cuando se intente conectar**
  const handleConnect = useCallback(() => {
    console.log("🔵 Intentando abrir el modal...");
    setIsModalOpen(true);
  }, []);

  // ✅ **Cerrar sesión y resetear el estado**
  const handleLogout = useCallback(() => {
    disconnectWallet();
    logout();
    syncWalletStatus(); // 🔄 Asegurar revalidación
  }, [syncWalletStatus]);

  // ✅ **Cuando el modal se cierra, verificar estado de la wallet**
  const handleWalletConnected = useCallback(() => {
    console.log("✅ Wallet conectada. Revalidando estado...");
    syncWalletStatus();
    setIsModalOpen(false);
  }, [syncWalletStatus]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "Connect Wallet"),
    [balance]
  );

  return (
    <div className="wallet-container">
      <button className="wallet-button" onClick={handleConnect} disabled={!isReady}>
        <span aria-live="polite">
          {walletStatus === "connected" ? formattedBalance : "Connect Wallet"}
        </span>
      </button>

      <button
        className="menu-button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Menu"
        disabled={!isReady}
      >
        <span className="menu-icon"></span>
      </button>

      <WalletMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} handleLogout={handleLogout} />

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onWalletConnected={handleWalletConnected} />
    </div>
  );
});

export default WalletButton;
