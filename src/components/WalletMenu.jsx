import React from "react";
import { disconnectWallet } from "../utils/solanaHelpers.js";
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletAddress, handleConnectModal, handleLogout, menuRef }) {
    if (!isOpen) return null;

    const handleLogoutClick = async () => {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            try {
                // Desconectar todas las wallets
                const selectedWallet = localStorage.getItem('selectedWallet');
                if (selectedWallet) {
                    await disconnectWallet(selectedWallet);
                }
            } catch (error) {
                console.error("Error al desconectar la wallet:", error);
            } finally {
                console.log("Wallet logged out"); // Log de desconexión
                localStorage.removeItem('jwtToken'); // Eliminar el token JWT al desconectar
                localStorage.removeItem('selectedWallet'); // Eliminar la wallet seleccionada al desconectar
                handleLogout();
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

