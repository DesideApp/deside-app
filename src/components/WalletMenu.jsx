import React from "react";
import { disconnectWallet } from "../utils/solanaHelpers.js";
import "./WalletMenu.css";

function WalletMenu({ 
    isOpen, 
    onClose, 
    walletAddress, 
    handleConnectModal, 
    handleLogout, 
    menuRef 
}) {
    if (!isOpen) return null;

    const handleLogoutClick = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            try {
                const selectedWallet = localStorage.getItem("selectedWallet");
                
                if (selectedWallet) {
                    await disconnectWallet(selectedWallet); // Desconectar la wallet activa
                }

                // Limpieza de datos locales
                localStorage.removeItem("jwtToken"); 
                localStorage.removeItem("selectedWallet");
            } catch (error) {
                console.error("Error disconnecting wallet:", error);
            } finally {
                console.log("Wallet disconnected");
                handleLogout(); // Llamada a la función de logout proporcionada
            }
        }
    };

    return (
        <div className="wallet-menu-overlay" onClick={onClose}>
            <div className="wallet-menu" onClick={(e) => e.stopPropagation()} ref={menuRef}>
                <h2>Wallet Menu</h2>
                <p>Connected Wallet: {walletAddress}</p>
                <button onClick={handleConnectModal}>Connect Another Wallet</button>
                <button onClick={handleLogoutClick}>Logout</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default WalletMenu;
