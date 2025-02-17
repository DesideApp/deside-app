import React, { useState, useEffect } from "react";
import { ensureWalletState, disconnectWallet, getConnectedWallet } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ Nueva forma segura de sincronizar la wallet
    useEffect(() => {
        const updateWalletStatus = async () => {
            const status = await getConnectedWallet();
            setWalletStatus(status || { walletAddress: null, isAuthenticated: false });
        };

        updateWalletStatus();

        const handleWalletConnected = (e) => {
            setWalletStatus({ walletAddress: e.detail.wallet, isAuthenticated: true });
            setIsModalOpen(false);
        };

        const handleWalletDisconnected = () => {
            setWalletStatus({ walletAddress: null, isAuthenticated: false });
        };

        window.addEventListener("walletConnected", handleWalletConnected);
        window.addEventListener("walletDisconnected", handleWalletDisconnected);

        return () => {
            window.removeEventListener("walletConnected", handleWalletConnected);
            window.removeEventListener("walletDisconnected", handleWalletDisconnected);
        };
    }, []);

    // 🔹 **Lógica de conexión simplificada con `ensureWalletState()`**
    const handleConnect = async () => {
        const status = await ensureWalletState();
        if (status) setWalletStatus(status);
    };

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={handleConnect}>
                {walletStatus.walletAddress ? "Change Wallet" : "Connect Wallet"}
            </button>

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
