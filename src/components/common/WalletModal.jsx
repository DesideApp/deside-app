import React, { useState, useEffect } from "react";
import { connectWallet, getConnectedWallet, authenticateWallet } from "../../services/walletService"; 
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    useEffect(() => {
        if (isOpen) {
            const status = getConnectedWallet();
            setWalletStatus(status);
        }
    }, [isOpen]);

    const handleWalletSelection = async (walletType) => {
        try {
            // 🔍 Si ya está autenticado, cierra el modal sin pedir nada.
            if (walletStatus.walletAddress && walletStatus.isAuthenticated) {
                console.log("✅ Ya autenticado. No se necesita conexión ni firma.");
                onClose();
                return;
            }

            // 🛠️ Si no hay wallet conectada, primero conecta la wallet
            if (!walletStatus.walletAddress) {
                console.log(`🔵 Conectando con ${walletType}...`);
                await connectWallet(walletType);
            }

            // 🔑 Si la wallet está conectada pero no autenticada, solicita firma
            const updatedStatus = getConnectedWallet();
            if (updatedStatus.walletAddress && !updatedStatus.isAuthenticated) {
                console.log("🟡 Autenticando wallet...");
                await authenticateWallet(walletType);
            }

            // 🚀 Después de conectar y autenticar, actualiza el estado y cierra el modal
            setWalletStatus(getConnectedWallet());
            onClose();

        } catch (error) {
            console.error("❌ Error al conectar o autenticar la wallet:", error);
        }
    };

    if (!isOpen) return null;

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
