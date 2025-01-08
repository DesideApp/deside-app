import React from "react";
import "./WalletModal.css";

const WalletModal = ({ isOpen, onClose, onSelectWallet }) => {
  const wallets = [
    { name: "Backpack", provider: window.backpack },
    { name: "Phantom", provider: window.phantom },
  ];

  const handleSelectWallet = (wallet) => {
    if (wallet.provider) {
      onSelectWallet(wallet.provider);
    } else {
      console.error("Proveedor no disponible para", wallet.name);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Connect Wallet</h2>
        <p>Select a wallet to connect:</p>
        <div className="wallet-options">
          {wallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => handleSelectWallet(wallet)}
            >
              {wallet.name}
            </button>
          ))}
          {/* Agrega más opciones de wallets aquí */}
        </div>
        <button className="close-modal" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
