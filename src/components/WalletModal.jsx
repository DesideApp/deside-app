import React from "react";
import "./WalletModal.css";

function WalletModal({ isOpen, onClose, onSelectWallet }) {
    if (!isOpen) return null;

    return (
        <div className="wallet-modal-overlay" onClick={onClose}>
            <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Connect Wallet</h2>
                <p>Select a wallet to connect:</p>
                <div className="wallet-options">
                    <button onClick={() => onSelectWallet("phantom")}>
                        Phantom Wallet
                    </button>
                    <button onClick={() => onSelectWallet("backpack")}>
                        Backpack Wallet
                    </button>
                    <button onClick={() => onSelectWallet("magiceden")}>
                        Magic Eden Wallet
                    </button>
                    {/* Agrega más opciones de wallets aquí */}
                </div>
                <button className="close-modal" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

export default WalletModal;
