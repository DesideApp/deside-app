import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Copy } from "lucide-react";
import SolanaLogo from "./SolanaLogo.jsx";
import "./WalletMenu.css";

const shortenAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
};

const WalletMenu = memo(({ isOpen, onClose, handleLogout, walletAddress, balance, openWalletModal }) => {
  const menuRef = useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

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
        {!walletAddress ? (
          <div className="wallet-disconnected">
            <p className="no-wallet">⚠️ No wallet connected.</p>
            <button
              className="connect-button"
              onClick={openWalletModal}
              aria-label="Connect Wallet"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <header className="wallet-header">
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
            </header>

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

            {copySuccess && <p className="copy-success">✅ Copied!</p>}

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
    </div>
  );
});

export default WalletMenu;
