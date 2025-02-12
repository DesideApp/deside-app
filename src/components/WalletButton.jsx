import React, { useState, useEffect } from "react";
import { getConnectedWallet, connectWallet, disconnectWallet, getWalletBalance } from "../services/walletService.js";
import { logout } from "../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText = "Connect Wallet", openModal }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
                setBalance(await getWalletBalance(connectedWallet.walletAddress));
            }
        };

        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);

        return () => window.removeEventListener("walletConnected", updateWalletStatus);
    }, []);

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={() => setIsModalOpen(true)}>
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : buttonText}
            </button>

            {balance !== null && !isNaN(balance) && (
                <div className="wallet-balance">
                    <p>{parseFloat(balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button className="menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                <span className="menu-icon"></span>
            </button>

            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletAddress={walletAddress}
                handleLogout={logout}
            />

            <WalletModal isOpen={isModalOpen || openModal} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default WalletButton;
