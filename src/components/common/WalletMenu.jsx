import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Copy } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext";
import { checkAuthStatus, logout } from "../../services/apiService.js";
import { disconnectWallet } from "../../services/walletService.js"; 
import { getBalance } from "../../utils/solanaHelpers.js"; 
import DonationModal from "./DonationModal";
import "./WalletMenu.css";

const WalletMenu = React.memo(({ isOpen, onClose }) => {
  const menuRef = useRef(null);
  const { walletAddress, isReady } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ Verificar autenticación con el backend solo si cambia la wallet
  useEffect(() => {
    if (!walletAddress) {
      setIsAuthenticated(false);
      setBalance(null);
      return;
    }

    let isMounted = true;

    const verifyAuth = async () => {
      try {
        const status = await checkAuthStatus();
        if (isMounted) {
          setIsAuthenticated(status.isAuthenticated);
          if (status.isAuthenticated) {
            const walletBalance = await getBalance(walletAddress);
            setBalance(walletBalance);
          } else {
            setBalance(null);
          }
        }
      } catch (error) {
        console.error("❌ Error verificando autenticación:", error);
        if (isMounted) {
          setIsAuthenticated(false);
          setBalance(null);
        }
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [walletAddress]);

  // ✅ Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopy = useCallback(async () => {
    try {
      if (walletAddress) {
        await navigator.clipboard.writeText(walletAddress);
        alert("✅ Dirección copiada al portapapeles.");
      }
    } catch (error) {
      console.error("❌ Error copiando la dirección:", error);
    }
  }, [walletAddress]);

  const handleLogout = useCallback(async () => {
    await disconnectWallet();
    await logout();
    setIsAuthenticated(false);
    setBalance(null);
    onClose();
  }, [onClose]);

  const formattedBalance = useMemo(
    () => (balance !== null ? `${balance.toFixed(2)} SOL` : "0 SOL"),
    [balance]
  );

  if (!isReady) return null;

  return (
    <>
      {isOpen && (
        <div className="wallet-menu open" ref={menuRef}>
          <div className="wallet-menu-content">
            {isAuthenticated ? (
              <>
                <div className="wallet-header">
                  <p className="wallet-network">🔗 Solana</p>
                  <p className="wallet-balance">{formattedBalance}</p>
                </div>

                <div className="wallet-address-container">
                  <p className="wallet-address">{walletAddress}</p>
                  <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                    <Copy size={18} />
                  </button>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                  Disconnect
                </button>

                <button className="donate-button" onClick={() => setIsDonationOpen(true)}>
                  Support Us 💜
                </button>
              </>
            ) : (
              <div className="wallet-disconnected">
                <p className="no-wallet">⚠️ No wallet connected.</p>
                <button className="connect-button" onClick={onClose}>
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </>
  );
});

export default WalletMenu;
