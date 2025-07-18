import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy, Eye, Check } from "lucide-react";
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
    const [isExpanded, setIsExpanded] = useState(false);
    const { theme } = useLayout();

    const solanaLogo =
      theme === "dark"
        ? "/companys/marcasolanadark.svg"
        : "/companys/marcasolanalight.svg";

    const desideLogo =
      theme === "dark"
        ? "/assets/desidelogodark.svg"
        : "/assets/desidelogolight.svg";

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

    useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleCopy = useCallback(async () => {
      if (!walletAddress || copySuccess) return;
      try {
        await navigator.clipboard.writeText(walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("[WalletMenu] ❌ Error copiando la dirección:", error);
      }
    }, [walletAddress, copySuccess]);

    const toggleExpanded = () => setIsExpanded((prev) => !prev);

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
              <div className="wallet-network">
                <span>Chain</span>
                <img src={solanaLogo} alt="Solana" />
              </div>
            ) : (
              <p className="no-wallet">Please connect a Solana wallet to continue</p>
            )}
          </div>

          {/* BODY */}
          <div className="wallet-menu-body">
            {walletAddress ? (
              <>
                <div className="wallet-info-box">
                  <span className="wallet-info-title">Balance</span>
                  <div className="wallet-info-value balance">
                    <span>{balance !== null ? balance.toFixed(2) : "0.00"}</span>
                    <div className="solana-logo-wrapper">
                      <img
                        src={
                          theme === "dark"
                            ? "/companys/solanadark.svg"
                            : "/companys/solanalight.svg"
                        }
                        alt="SOL"
                        className="solana-logo-inline"
                      />
                    </div>
                  </div>
                </div>

                <div className="wallet-info-box pubkey-box">
                  <div className="wallet-info-title-row">
                    <span className="wallet-info-title">Public Key</span>
                    <button
                      className="eye-toggle-button"
                      onClick={toggleExpanded}
                      aria-label="Show full address"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                  <div className="wallet-info-value">
                    <span className="wallet-address">
                      {isExpanded ? walletAddress : shortenAddress(walletAddress)}
                    </span>
                    <div className="wallet-info-actions">
                      <button className="copy-button" onClick={handleCopy} aria-label="Copy Wallet Address">
                        {copySuccess ? (
                          <Check size={18} color="#28a745" />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="logout-button"
                  onClick={handleLogout}
                  aria-label="Disconnect Wallet"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                className="connect-button"
                onClick={openWalletModal}
                aria-label="Connect Wallet"
              >
                Log in
              </button>
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
