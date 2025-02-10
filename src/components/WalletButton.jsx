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
        console.log("🟡 Comprobando estado de la wallet en el inicio...");
        
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                console.log("✅ Wallet encontrada en localStorage:", connectedWallet.walletAddress);
                setWalletAddress(connectedWallet.walletAddress);
                setBalance(await getWalletBalance(connectedWallet.walletAddress));
            } else {
                console.log("❌ No hay wallet conectada.");
            }
        };
    
        updateWalletStatus();
    }, []);
    

    // Conectar wallet y firmar mensaje para obtener JWT
    const handleConnect = async (wallet) => {
        try {
            console.log("🔵 Intentando conectar desde WalletButton...");
    
            const address = await connectWallet(wallet);
            console.log("✅ Wallet conectada en WalletButton:", address);
    
            setWalletAddress(address);
            localStorage.setItem('selectedWallet', wallet);
    
            // 🔴 FUERZA EL ESTADO PARA ASEGURAR QUE SE ACTUALIZA
            setTimeout(() => {
                setWalletAddress(localStorage.getItem('selectedWallet'));
                console.log("🔄 Estado de wallet forzado:", localStorage.getItem('selectedWallet'));
            }, 500);
    
        } catch (error) {
            console.error("❌ Error connecting wallet:", error);
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
