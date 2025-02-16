import React, { useState, useEffect } from "react";
import { getConnectedWallet, connectWallet, disconnectWallet, getWalletBalance, authenticateWallet } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText = "Connect Wallet" }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        balance: null,
        isAuthenticated: false
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const updateWalletStatus = async () => {
            const connectedWallet = getConnectedWallet();
            setWalletStatus(connectedWallet);
        };

        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, []);

    const handleConnect = async () => {
        if (walletStatus.walletAddress && !walletStatus.isAuthenticated) {
            console.log("🔐 Solicitando autenticación...");
            await authenticateWallet("phantom");
            setWalletStatus(getConnectedWallet());
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={handleConnect}>
                {walletStatus.walletAddress ? `${walletStatus.walletAddress.slice(0, 5)}...` : buttonText}
            </button>

            {walletStatus.balance !== null && !isNaN(walletStatus.balance) && (
                <div className="wallet-balance">
                    <p>{parseFloat(walletStatus.balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                <span className="menu-icon"></span>
            </button>

            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletStatus={walletStatus}
                handleLogout={() => {
                    disconnectWallet();
                    logout();
                }}
            />

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default WalletButton;
