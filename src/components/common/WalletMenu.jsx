import React, { useRef, useEffect } from "react";
import { Copy } from "lucide-react";
import { useWallet } from "../../contexts/WalletContext"; // ✅ Usar el contexto global
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, handleLogout }) {
  const menuRef = useRef(null);
  const { walletAddress, walletStatus } = useWallet(); // ✅ Obtener el estado global de la wallet

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

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      alert("✅ Dirección copiada al portapapeles.");
    }
  };

  // ✅ Verificar que el contexto esté cargado correctamente
  if (!walletAddress || walletStatus === "not_connected") {
    return null; // No renderizar nada si la wallet no está conectada
  }

  return (
    <>
      {isOpen && (
        <div className="wallet-menu open" ref={menuRef}>
          <div className="wallet-menu-content">
            {walletAddress ? (
              <>
                <div className="wallet-header">
                  <p className="wallet-network">🔗 Solana</p>
                  {/* ✅ Evitar error si walletStatus.balance está undefined */}
                  <p className="wallet-balance">
                    {walletStatus.balance
                      ? `${walletStatus.balance.toFixed(2)} SOL`
                      : "-- SOL"}
                  </p>
                </div>

                <div className="wallet-address-container">
                  <p className="wallet-address">{walletAddress}</p>
                  <button
                    className="copy-button"
                    onClick={handleCopy}
                    aria-label="Copy Address"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                  Disconnect
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
    </>
  );
}

export default WalletMenu;
