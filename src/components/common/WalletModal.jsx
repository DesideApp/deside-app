import React from "react";
import "./WalletModal.css";

// Opciones de wallets
const WALLETS = [
  { id: "phantom", name: "Phantom" },
  { id: "backpack", name: "Backpack" },
  { id: "magiceden", name: "Magic Eden" },
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
        <div className="wallet-modal-container">
          <h2 id="wallet-modal-title">Select Your Wallet</h2>
        </div>

        <div className="wallet-options">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onWalletSelected(wallet.id)} // Pasamos el tipo de wallet
              aria-label={`Connect to ${wallet.name}`}
              className="wallet-option"
            >
              {wallet.name}
            </button>
          ))}
        </div>

        <button
          className="close-modal"
          onClick={onClose}
          aria-label="Close Wallet Modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;