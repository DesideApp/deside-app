import React, { useState, useEffect } from "react";
import { connectWallet, getConnectedWallet, authenticateWallet } from "../../services/walletService"; 
import "./WalletModal.css";

function WalletModal({ isOpen, onClose }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    // 🔄 **Actualiza el estado de la wallet al abrir el modal**
    useEffect(() => {
        if (isOpen) {
            setWalletStatus(getConnectedWallet());
        }
    }, [isOpen]);

    const handleWalletSelection = async (walletType) => {
        try {
            let updatedStatus = getConnectedWallet();

            if (updatedStatus.walletAddress && updatedStatus.isAuthenticated) {
                console.log("✅ Ya autenticado. No se necesita conexión ni firma.");
                onClose();
                return;
            }

            if (!updatedStatus.walletAddress) {
                console.log(`🔵 Conectando con ${walletType}...`);
                await connectWallet(walletType);
                updatedStatus = getConnectedWallet(); // 🛠️ **Actualizar estado tras conexión**
            }

            if (updatedStatus.walletAddress && !updatedStatus.isAuthenticated) {
                console.log("🟡 Autenticando wallet...");
                await authenticateWallet(walletType);
                updatedStatus = getConnectedWallet(); // 🛠️ **Actualizar estado tras autenticación**
            }

            setWalletStatus(updatedStatus);
            if (updatedStatus.isAuthenticated) {
                onClose(); // 🔄 **Cerrar solo si todo fue exitoso**
            }
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
