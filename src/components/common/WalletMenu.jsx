import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Copy } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import { checkAuthStatus } from "../../services/apiService.js";
import DonationModal from "./DonationModal";
import "./WalletMenu.css";

const WalletMenu = memo(({ handleLogout, openWalletModal }) => {
  const menuRef = useRef(null);
  const { walletAddress, isReady } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ **Verificar autenticación solo si cambia la wallet**
  const fetchAuthStatus = useCallback(async () => {
    if (!walletAddress) {
      setIsAuthenticated(false);
      setBalance(null);
      return;
    }

    try {
      const status = await checkAuthStatus();
      setIsAuthenticated(status.isAuthenticated);
    } catch (error) {
      console.error("❌ Error verificando autenticación:", error);
      setIsAuthenticated(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchAuthStatus();
  }, [fetchAuthStatus]);

  // ✅ **Escuchar eventos globales para sincronización automática**
  useEffect(() => {
    const handleWalletConnected = () => fetchAuthStatus();
    const handleWalletDisconnected = () => {
      setIsAuthenticated(false);
      setBalance(null);
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, [fetchAuthStatus]);

  // ✅ **Cerrar menú al hacer clic fuera**
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        alert("✅ Dirección copiada al portapapeles.");
      } catch (error) {
        console.error("❌ Error copiando la dirección:", error);
      }
    }
  }, [walletAddress]);

  // ✅ **Cerrar menú después de logout**
  const handleLogoutAndCloseMenu = useCallback(() => {
    handleLogout();
    setIsOpen(false);
  }, [handleLogout]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "0 SOL"),
    [balance]
  );

  if (!isReady) return null;

  return (
    <>
      {/* ✅ Botón del menú ahora abre/cierra el menú correctamente */}
      <button
        className="menu-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
        disabled={!isReady}
      >
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {isOpen && (
        <div className="wallet-menu open" ref={menuRef}>
          <div className="wallet-menu-content">
            {!isAuthenticated ? (
              <div className="wallet-disconnected">
                <p className="no-wallet">⚠️ No wallet connected.</p>
                <button className="connect-button" onClick={openWalletModal}>
                  Connect Wallet
                </button>
              </div>
            ) : (
              <>
                <header className="wallet-header">
                  <p className="wallet-network">🔗 Solana</p>
                  <p className="wallet-balance">{formattedBalance}</p>
                </header>

                <div className="wallet-address-container">
                  <p className="wallet-address">{walletAddress}</p>
                  <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                    <Copy size={18} />
                  </button>
                </div>

                {/* ✅ Ahora WalletMenu solo invoca handleLogout y cierra el menú */}
                <button className="logout-button" onClick={handleLogoutAndCloseMenu}>
                  Disconnect
                </button>

                <button className="donate-button" onClick={() => setIsDonationOpen(true)}>
                  Support Us ❤️
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </>
  );
});

export default WalletMenu;
