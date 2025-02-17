import React, { useState, useEffect } from "react";
import { getConnectedWallet, connectWallet, disconnectWallet, authenticateWallet } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText = "Connect Wallet" }) {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 🔄 **Sincronizar estado de la wallet al montar el componente**
    useEffect(() => {
        const updateWalletStatus = async () => {
            const status = getConnectedWallet();
            setWalletStatus(status);
        };

        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, []);

    // 🔹 **Lógica central de conexión**
    const handleConnect = async () => {
        try {
            if (!walletStatus.walletAddress) {
                console.log("🔵 No hay wallet conectada, abriendo modal...");
                setIsModalOpen(true);
                return;
            }

            if (!walletStatus.isAuthenticated) {
                console.log("🔐 Wallet conectada, autenticando...");
                await authenticateWallet("phantom");
                setWalletStatus(getConnectedWallet());
                return;
            }

            console.log("✅ Wallet ya autenticada.");
        } catch (error) {
            console.error("❌ Error en handleConnect():", error);
        }
    };

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={handleConnect}>
                {walletStatus.walletAddress ? `${walletStatus.walletAddress.slice(0, 5)}...` : buttonText}
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
