import React from "react";
import "./WalletModal.css";

// Opciones de wallets disponibles
const WALLETS = [
  { id: "phantom", name: "Phantom", icon: "phantom.svg" },
  { id: "backpack", name: "Backpack", icon: "backpack.svg" },
  { id: "magiceden", name: "Magic Eden", icon: "mewallet.svg" },
];

const WalletModal = ({ isOpen, onClose, onWalletSelected }) => {
  if (!isOpen) return null;

  return (
    <div
      className="wallet-modal-overlay"
      onClick={onClose}
      aria-hidden="true"
      role="presentation"
    >
      <div
        className="wallet-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="wallet-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="wallet-modal-header">
          <div id="wallet-modal-title">Connect wallet</div>
        </div>

        {/* Body */}
        <div className="wallet-modal-body">
          {/* Blockchain Info */}
          <div className="wallet-info-box chain-box">
            <div className="wallet-info-value">
              <span className="wallet-info-title">Chain</span>
              <img
                src="/companys/solanacolor.svg"
                alt="Solana Logo"
                className="solana-logo-inline"
              />
            </div>
          </div>
          {/* Wallet options */}
          <div className="wallet-options">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => onWalletSelected(wallet.id)}
                className="wallet-option"
              >
                <div className="wallet-option-content">
                  <img
                    src={`/companys/${wallet.icon}`}
                    alt={`${wallet.name} logo`}
                    className="wallet-icon"
                    style={{ width: "30px", height: "30px" }}
                  />
                  <span className="wallet-name">{wallet.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="wallet-modal-footer">
          <div
            className="close-modal"
            onClick={onClose}
            aria-label="Close Wallet Modal"
          >
            CLOSE
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
