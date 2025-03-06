import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import "./WalletMenu.css";

const WalletMenu = memo(({ isOpen, onClose, handleLogout, walletAddress, balance, openWalletModal }) => {
  const menuRef = useRef(null);

  // ✅ **Cerrar menú al hacer clic fuera**
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
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
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      alert("✅ Dirección copiada al portapapeles.");
    } catch (error) {
      console.error("❌ Error copiando la dirección:", error);
    }
  }, [walletAddress]);

  return (
    <>
      {/* ✅ Botón del menú con las tres líneas bien formateadas */}
      <button className="menu-button" onClick={onClose} aria-label="Menu">
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
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
                <button className="logout-button" onClick={handleLogout}>
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default WalletMenu;
