import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import { checkAuthStatus } from "../../services/apiService.js";
import { getConnectedWallet } from "../../services/walletService.js"; // ✅ Nuevo método
import DonationModal from "./DonationModal";
import "./WalletMenu.css";

const WalletMenu = memo(({ handleLogout, openWalletModal }) => {
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  // ✅ **Verificar autenticación cuando se detecta una wallet**
  useEffect(() => {
    const fetchWalletAndAuth = async () => {
      const { walletAddress } = await getConnectedWallet(); // 🔄 Detecta la wallet conectada en Web3
      setWalletAddress(walletAddress);

      if (walletAddress) {
        try {
          const status = await checkAuthStatus();
          setIsAuthenticated(status.isAuthenticated);
        } catch (error) {
          console.error("❌ Error verificando autenticación:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    fetchWalletAndAuth();
  }, []);

  // ✅ **Escuchar eventos globales para sincronización automática**
  useEffect(() => {
    const handleWalletConnected = async () => {
      console.log("🔄 Evento walletConnected detectado...");
      const { walletAddress } = await getConnectedWallet();
      setWalletAddress(walletAddress);
    };

    const handleWalletDisconnected = () => {
      console.warn("❌ Wallet desconectada.");
      setWalletAddress(null);
      setIsAuthenticated(false);
      setBalance(null);
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    window.addEventListener("walletDisconnected", handleWalletDisconnected);

    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
      window.removeEventListener("walletDisconnected", handleWalletDisconnected);
    };
  }, []);

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

  return (
    <>
      {/* ✅ Botón del menú con animación */}
      <button
        className={`menu-button ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
      >
        <div className="menu-icon">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </button>

      {isOpen && (
        <div className="wallet-menu open" ref={menuRef}>
          <div className="wallet-menu-content">
            {!walletAddress ? (
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
                  <p className="wallet-balance">{balance !== null ? `${balance.toFixed(2)} SOL` : "0 SOL"}</p>
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
