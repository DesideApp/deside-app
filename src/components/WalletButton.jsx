import React, { useState, useEffect, useRef } from "react";
import {
    connectWallet,
    signMessage,
    getConnectedWallet,
    disconnectWallet,
    getWalletBalance
} from "../services/walletService.js";
import { authenticateWithServer, logout } from "../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText = "Connect Wallet" }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    // Cargar estado de la wallet al iniciar
    useEffect(() => {
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
                const solBalance = await getWalletBalance(connectedWallet.walletAddress);
                setBalance(solBalance);
            }
        };
        updateWalletStatus();
    }, []);

    // Conectar wallet y firmar mensaje para obtener JWT
    const handleConnect = async (wallet) => {
        try {
            const address = await connectWallet(wallet);
            setWalletAddress(address);
            localStorage.setItem('selectedWallet', wallet);

            // Obtener balance
            const solBalance = await getWalletBalance(address);
            setBalance(solBalance);

            // Autenticación con firma
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            await authenticateWithServer(address, signedData.signature, message);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        } finally {
            setIsModalOpen(false);
        }
    };

    // Logout completo (desconectar wallet y borrar sesión)
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

            <WalletMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} handleLogout={handleLogout} />
            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={handleConnect} />
        </div>
    );
}

export default WalletButton;
