import React from "react";
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletAddress, handleLogout }) {
    return (
        <div className={`wallet-menu ${isOpen ? "open" : ""}`}>
            <div className="wallet-menu-header">
                <h2>Wallet Menu</h2>
                <button onClick={onClose} className="close-button">X</button>
            </div>
            <div className="wallet-menu-content">
                {walletAddress ? (
                    <div>
                        <p>Connected Wallet:</p>
                        <p className="wallet-address">{walletAddress}</p>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <p>No wallet connected</p>
                )}
            </div>
        </div>
    );
}

export default WalletMenu;
