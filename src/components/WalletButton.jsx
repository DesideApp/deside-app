import React, { useState, useEffect, useRef } from "react";
import {
    connectWallet,
    getConnectedWallet,
    disconnectWallet,
    getWalletBalance
} from "../services/walletService.js";
import { logout } from "../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText = "Connect Wallet" }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        console.log("🟡 Comprobando estado de la wallet...");
        
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                console.log("✅ Wallet detectada:", connectedWallet.walletAddress);
                setWalletAddress(connectedWallet.walletAddress);
                setBalance(await getWalletBalance(connectedWallet.walletAddress));
            }
        };

        updateWalletStatus();
    }, []);

    const handleConnect = async (wallet) => {
        try {
            console.log("🔵 Intentando conectar...");
            const address = await connectWallet(wallet);
            console.log("✅ Wallet conectada:", address);
            setWalletAddress(address);
            localStorage.setItem('selectedWallet', wallet);
        } catch (error) {
            console.error("❌ Error al conectar:", error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleLogout = () => {
        if (!window.confirm("Are you sure you want to disconnect?")) return;
        disconnectWallet();
        logout();
        setWalletAddress(null);
        setBalance(null);
        setIsMenuOpen(false);
    };

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
                handleLogout={handleLogout}
            />

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={handleConnect} />
        </div>
    );
}

export default WalletButton;
