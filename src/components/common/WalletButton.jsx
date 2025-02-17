import React, { useState, useEffect } from "react";
import { ensureWalletState, disconnectWallet, getConnectedWallet, getWalletBalance } from "../../services/walletService.js";
import { logout } from "../../services/authServices.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
    const [walletStatus, setWalletStatus] = useState({
        walletAddress: null,
        isAuthenticated: false,
        balance: null
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ✅ **Sincronizar estado de la wallet y el balance**
    useEffect(() => {
        const updateWalletStatus = async () => {
            const status = await getConnectedWallet();
            if (status.walletAddress) {
                const balance = await getWalletBalance(status.walletAddress);
                setWalletStatus({ ...status, balance });
            } else {
                setWalletStatus({ walletAddress: null, isAuthenticated: false, balance: null });
            }
        };

        updateWalletStatus();

        const handleWalletConnected = async (e) => {
            const balance = await getWalletBalance(e.detail.wallet);
            setWalletStatus({ walletAddress: e.detail.wallet, isAuthenticated: true, balance });
            setIsModalOpen(false);
        };

        const handleWalletDisconnected = () => {
            setWalletStatus({ walletAddress: null, isAuthenticated: false, balance: null });
        };

        // 📌 **Escuchar cambios en la wallet (ej: cambio de cuenta en Phantom)**
        if (window.solana) {
            window.solana.on("connect", updateWalletStatus);
            window.solana.on("disconnect", handleWalletDisconnected);
            window.solana.on("accountChanged", updateWalletStatus);
        }

        window.addEventListener("walletConnected", handleWalletConnected);
        window.addEventListener("walletDisconnected", handleWalletDisconnected);

        return () => {
            if (window.solana) {
                window.solana.off("connect", updateWalletStatus);
                window.solana.off("disconnect", handleWalletDisconnected);
                window.solana.off("accountChanged", updateWalletStatus);
            }

            window.removeEventListener("walletConnected", handleWalletConnected);
            window.removeEventListener("walletDisconnected", handleWalletDisconnected);
        };
    }, []);

    // 🔹 **Lógica de conexión con `ensureWalletState()`**
    const handleConnect = async () => {
        const status = await ensureWalletState();  // Esto abrirá el modal si no estamos conectados.
        if (!status.walletAddress) {
            setIsModalOpen(true); // Modal abierto si no estamos conectados
            return;
        }

        const balance = await getWalletBalance(status.walletAddress);
        setWalletStatus({ ...status, balance });
    };

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={handleConnect}>
                {walletStatus.walletAddress
                    ? `${walletStatus.balance ? walletStatus.balance.toFixed(2) : "--"} SOL`
                    : "Connect Wallet"}
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

            {/* Abre el Modal cuando no estamos conectados */}
            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default WalletButton;
