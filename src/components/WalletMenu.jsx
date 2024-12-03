import React from "react";
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletAddress, handleConnect, handleLogout, menuRef }) {
    return (
        <div ref={menuRef} className={`wallet-menu ${isOpen ? "open" : ""}`}>
            <div className="wallet-menu-header">
                <h2>Wallet Menu</h2>
                <button onClick={onClose} className="close-button">X</button>
            </div>
            <div className="wallet-menu-content">
                {walletAddress ? (
                    <div>
                        <p>Connected Wallet:</p>
                        <p className="wallet-address">{walletAddress}</p>
                        <button className="wallet-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div>
                        <p>Welcome! Please connect your wallet.</p>
                        <button className="wallet-button" onClick={handleConnect}>
                            Connect Wallet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WalletMenu;

