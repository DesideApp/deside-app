import React from "react";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onWalletSelected }) => {
  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose} aria-hidden="true">
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="wallet-modal-title">
        <div className="wallet-modal-container">
          <h2 id="wallet-modal-title">Select Your Wallet</h2>
        </div>

        <div className="wallet-options">
          <button onClick={onWalletSelected} aria-label="Connect Wallet">
            Connect Wallet
          </button>
        </div>

        <button className="close-modal" onClick={onClose} aria-label="Close Wallet Modal">
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
