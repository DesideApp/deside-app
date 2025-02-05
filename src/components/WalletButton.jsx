import React, { useState, useEffect, useRef } from "react";
import { connectWallet, getBalance, signMessage, getConnectedWallet, disconnectWallet } from "../services/walletService"; // Actualizar importaciones
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(localStorage.getItem('selectedWallet') || null);
    const menuRef = useRef(null);
    const isSigning = useRef(false); // Añadir un ref para controlar la firma

    useEffect(() => {
        const updateConnectionStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
                try {
                    const solBalance = await getBalance(connectedWallet.walletAddress);
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }
            } else {
                setWalletAddress(null);
                setBalance(null);
            }
        };

        updateConnectionStatus();

        if (window.solana) {
            window.solana.on("connect", async () => {
                const address = window.solana.publicKey.toString();
                setWalletAddress(address);

                try {
                    const solBalance = await getBalance(address);
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }

                if (!isSigning.current) {
                    isSigning.current = true;
                    try {
                        const message = "Please sign this message to authenticate.";
                        const signedData = await signMessage(selectedWallet, message);
                        const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pubkey: address,
                                signature: signedData.signature,
                                message: message,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to verify signature.');
                        }

                        const data = await response.json();
                        localStorage.setItem('jwtToken', data.token);
                    } catch (error) {
                        console.error("Error signing message:", error);
                    } finally {
                        isSigning.current = false;
                    }
                }
            });

            window.solana.on("disconnect", () => {
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('selectedWallet');
            });
        }

        return () => {
            if (window.solana) {
                window.solana.removeAllListeners("connect");
                window.solana.removeAllListeners("disconnect");
            }
        };
    }, [selectedWallet]);

    const handleConnect = async (wallet) => {
        try {
            const address = await connectWallet(wallet);
            if (address) {
                setWalletAddress(address);
                setSelectedWallet(wallet);
                localStorage.setItem('selectedWallet', wallet);
                try {
                    const solBalance = await getBalance(address);
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }

                if (!isSigning.current) {
                    isSigning.current = true;
                    try {
                        const message = "Please sign this message to authenticate.";
                        const signedData = await signMessage(wallet, message);
                        const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pubkey: address,
                                signature: signedData.signature,
                                message: message,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to verify signature.');
                        }

                        const data = await response.json();
                        localStorage.setItem('jwtToken', data.token);
                    } catch (error) {
                        console.error("Error signing message:", error);
                    } finally {
                        isSigning.current = false;
                    }
                }
            }
        } catch (error) {
            console.error(`Error al conectar ${wallet} Wallet:`, error);
            alert(`Failed to connect ${wallet} Wallet. Please try again.`);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            try {
                disconnectWallet();
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('selectedWallet');
            } catch (error) {
                console.error("Error al desconectar la wallet:", error);
            }
        }
    };

    const handleToggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
        console.log("Menú Wallet:", !isMenuOpen); // Debug para ver el cambio de estado
    };

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
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : buttonText || "Connect Wallet"} {/* Línea relacionada */}
            </button>

            {balance !== null && !isNaN(balance) && (
                <div className="wallet-balance">
                    <p>Balance: {parseFloat(balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button className="menu-button" onClick={handleToggleMenu} aria-label="Menu">
                <span className="menu-icon"></span>
            </button>

            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                handleConnectModal={() => setIsModalOpen(true)}
                handleLogout={handleLogout}
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
