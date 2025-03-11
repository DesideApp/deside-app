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
          {["phantom", "backpack", "magiceden"].map((wallet) => (
            <button 
              key={wallet} 
              onClick={() => onWalletSelected(wallet)} 
              aria-label={`Connect to ${wallet}`}>
              {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
            </button>
          ))}
        </div>

        <button className="close-modal" onClick={onClose} aria-label="Close Wallet Modal">
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
