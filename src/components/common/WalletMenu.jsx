import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import { useLayout } from "../../contexts/LayoutContext";
import "./WalletMenu.css";

const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

const WalletMenu = memo(
  ({ isOpen, onClose, handleLogout, walletAddress, balance, openWalletModal }) => {
    const menuRef = useRef(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const { theme } = useLayout();

    const solanaLogo =
      theme === "dark"
        ? "/companys/marcasolanadark.svg"
        : "/companys/marcasolanalight.svg";

    const desideLogo =
      theme === "dark"
        ? "/assets/desidelogodark.svg"
        : "/assets/desidelogolight.svg";

    // Cierre por click fuera
    useEffect(() => {
      const handleClickOutside = (event) => {
        const isClickInside = menuRef.current?.contains(event.target);
        const isClickOnToggleButton = event.target.closest(".menu-button-wrapper");
        if (isOpen && !isClickInside && !isClickOnToggleButton) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Cierre por ESC
    useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    // Copiar dirección
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
              <div className="wallet-network-box">
                <span className="network-label">Chain</span>
                <img src={solanaLogo} alt="Solana" className="network-logo" />
              </div>
            ) : (
              <p className="no-wallet">Please connect a Solana wallet to continue</p>
            )}
          </div>

          {/* BODY */}
          <div className="wallet-menu-body">
            {!walletAddress ? (
              <button className="connect-button" onClick={openWalletModal}>
                Log in
              </button>
            ) : (
              <>
                <div className="info-box">
                  <span className="info-title">Balance</span>
                  <span className="info-content">
                    {balance !== null ? balance.toFixed(2) : "0.00"}&nbsp;
                    <span className="info-unit">SOL</span>
                  </span>
                </div>

                <div className="info-box wallet-box">
                  <span className="info-title">Wallet</span>
                  <div className="wallet-address-actions">
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
                </div>

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
            <div className="footer-logo">
              <img src={desideLogo} alt="Deside" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default WalletMenu;
