import React from "react";
import { connectWallet } from "../../services/walletService"; // ✅ Importamos connectWallet
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const handleWalletSelection = async (walletType) => {
        try {
            await connectWallet(walletType);
            onClose(); // Cierra el modal después de conectar
        } catch (error) {
            console.error("❌ Error al conectar la wallet:", error);
        }
    };

    return (
        <div className="wallet-modal-overlay" onClick={onClose}>
            <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Connect Wallet</h2>
                <p>Select a wallet to connect:</p>
                <div className="wallet-options">
                    <button onClick={() => handleWalletSelection("phantom")}>Phantom Wallet</button>
                    <button onClick={() => handleWalletSelection("backpack")}>Backpack Wallet</button>
                    <button onClick={() => handleWalletSelection("magiceden")}>Magic Eden Wallet</button>
                </div>
                <button className="close-modal" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default WalletModal;
