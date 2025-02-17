import React from "react";
import { ensureWalletState } from "../../services/walletService"; 
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    // ✅ Simplificamos el flujo, sin repetir la lógica
    const handleWalletSelection = async (walletType) => {
        try {
            console.log(`🔵 Intentando conectar con ${walletType}...`);

            // Verificamos el estado de la wallet centralizadamente.
            const status = await ensureWalletState("authenticated");

            if (status?.walletAddress && status?.isAuthenticated) {
                console.log("✅ Wallet conectada y autenticada.");
                onClose(); // Cerramos el modal si ya está conectada y autenticada
            } else {
                console.warn("⚠️ No se pudo conectar o autenticar la wallet.");
            }
        } catch (error) {
            console.error("❌ Error al conectar la wallet:", error);
        }
    };

    return (
        <div className="wallet-modal-overlay" onClick={onClose}>
            <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
                <h2>🔗 Connect Your Wallet</h2>
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
