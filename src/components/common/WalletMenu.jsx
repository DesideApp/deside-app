import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import SolanaLogo from "./SolanaLogo.jsx";
import "./WalletMenu.css";

const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

const WalletMenu = memo(
  ({ isOpen, onClose, handleLogout, walletAddress, balance, openWalletModal }) => {
    const menuRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // ⛔️ Click fuera del menú para cerrar
    useEffect(() => {
      const handleClickOutside = (event) => {
        const isClickInside =
          menuRef.current && menuRef.current.contains(event.target);
        const isClickOnToggleButton = event.target.closest(".menu-button-wrapper");

        if (isOpen && !isClickInside && !isClickOnToggleButton) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // ⛔️ ESC para cerrar
    useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // ✅ Copiar dirección
    const handleCopy = useCallback(async () => {
      if (!walletAddress || copySuccess) return;

      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (error) {
        console.error("[WalletMenu] ❌ Error copiando la dirección:", error);
      }
    }, [walletAddress, copySuccess]);

    return (
      <div
        className={`wallet-menu ${isOpen ? "open" : ""}`}
        ref={menuRef}
        role="dialog"
        aria-labelledby="wallet-menu-title"
        aria-modal="true"
      >
        <div className="wallet-menu-content">
          {/* HEADER */}
          <div className="wallet-menu-header">
            {walletAddress ? (
              <>
                <div className="wallet-network">
                  <SolanaLogo width={24} height={24} />
                  <span>Solana</span>
                </div>
                <div className="wallet-balance-box">
                  <span className="balance-value">
                    {balance !== null ? balance.toFixed(2) : "0.00"}
                  </span>
                  <span className="balance-unit">SOL</span>
                </div>
              </>
            ) : (
              <p className="no-wallet">
                Please connect a Solana wallet to continue
              </p>
            )}
          </div>

          {/* BODY */}
          <div className="wallet-menu-body">
            {!walletAddress ? (
              <button
                className="connect-button"
                onClick={openWalletModal}
                aria-label="Connect Wallet"
              >
                Log in
              </button>
            ) : (
              <>
                <div className="wallet-address-container">
                  <p className="wallet-address">{shortenAddress(walletAddress)}</p>
                  <button
                    className="copy-button"
                    onClick={handleCopy}
                    aria-label="Copy Wallet Address"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                {copySuccess && <p className="copy-success">Copied!</p>}
                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Disconnect Wallet"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div className="wallet-menu-footer">
            {walletAddress && (
              <div className="footer-logos">
                {/* Solana */}
                <img
                  src="/company/marcasolanadark.svg"
                  alt="Solana"
                  className="solana-logo light-only"
                />
                <img
                  src="/company/marcasolanalight.svg"
                  alt="Solana"
                  className="solana-logo dark-only"
                />
                {/* Deside */}
                <img
                  src="/assets/desidelogodark.svg"
                  alt="Deside"
                  className="deside-logo light-only"
                />
                <img
                  src="/assets/desidelogolight.svg"
                  alt="Deside"
                  className="deside-logo dark-only"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default WalletMenu;
