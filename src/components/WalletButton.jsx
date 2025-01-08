import React, { useState, useEffect, useRef } from "react";
import { connectWallet, getBalance, signMessage, disconnectWallet } from "../utils/solanaHelpers.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(localStorage.getItem("selectedWallet") || null);
    const menuRef = useRef(null);
    const isSigning = useRef(false);

    // Actualiza el balance y JWT token al conectar la wallet
    const updateWalletData = async (address, wallet) => {
        try {
            const solBalance = await getBalance(address);
            console.log("Wallet balance:", solBalance);
            setBalance(solBalance);

            // Firma automática al conectar la wallet
            if (!isSigning.current) {
                isSigning.current = true;
                const message = "Please sign this message to authenticate.";
                const signedData = await signMessage(wallet, message);
                console.log("Signed data:", signedData);

                // Enviar la firma al backend para obtener el token JWT
                const response = await fetch("https://backend-deside.onrender.com/api/auth/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        pubkey: address,
                        signature: signedData.signature,
                        message: message,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to verify signature.");
                }

                const data = await response.json();
                console.log("JWT Token:", data.token);

                // Guardar el token JWT en localStorage
                localStorage.setItem("jwtToken", data.token);
            }
        } catch (error) {
            console.error("Error updating wallet data:", error);
        } finally {
            isSigning.current = false;
        }
    };

    // Manejo de conexión a wallet
    const handleConnect = async (wallet) => {
        try {
            // Desconectar cualquier wallet previamente conectada
            if (selectedWallet) {
                await disconnectWallet(selectedWallet);
            }

            const address = await connectWallet(wallet);
            if (address) {
                console.log(`Connected to ${wallet} Wallet:`, address);
                setWalletAddress(address);
                setSelectedWallet(wallet);
                localStorage.setItem("selectedWallet", wallet);

                // Actualizar balance y autenticar wallet
                await updateWalletData(address, wallet);
            }
        } catch (error) {
            console.error(`Error connecting ${wallet} Wallet:`, error);
            alert(`Failed to connect ${wallet} Wallet. Please try again.`);
        } finally {
            setIsModalOpen(false);
        }
    };

    // Manejo de logout
    const handleLogout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            try {
                if (selectedWallet) {
                    await disconnectWallet(selectedWallet);
                }
            } catch (error) {
                console.error("Error disconnecting wallet:", error);
            } finally {
                console.log("Wallet logged out");
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("selectedWallet");
            }
        }
    };

    // Manejo de eventos de conexión/desconexión de la wallet
    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", async () => {
                const address = window.solana.publicKey.toString();
                console.log("Wallet connected:", address);
                setWalletAddress(address);
                await updateWalletData(address, selectedWallet);
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet disconnected");
                handleLogout();
            });
        }

        return () => {
            if (window.solana) {
                window.solana.removeAllListeners("connect");
                window.solana.removeAllListeners("disconnect");
            }
        };
    }, [selectedWallet]);

    // Cerrar el menú si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={() => setIsModalOpen(true)}>
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : "Connect Wallet"}
            </button>

            {balance !== null && !isNaN(balance) && (
                <div className="wallet-balance">
                    <p>Balance: {parseFloat(balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button
                className="menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
            >
                <span className="menu-icon"></span>
            </button>

            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletAddress={walletAddress}
                handleConnectModal={() => setIsModalOpen(true)}
                handleLogout={handleLogout}
                menuRef={menuRef}
            />

            <WalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectWallet={handleConnect}
            />
        </div>
    );
}

export default WalletButton;
