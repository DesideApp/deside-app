import React, { useState, useEffect, useRef } from "react";
import { getBalance } from "../utils/solanaHelpers.js"; // Importar desde solanaHelpers.js
import { connectWallet, signMessage } from "../services/walletService"; // Importar desde walletService.js
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText }) { // Cambiar prop id a buttonText
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState(localStorage.getItem('selectedWallet') || null);
    const menuRef = useRef(null);
    const isSigning = useRef(false); // Añadir un ref para controlar la firma

    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", async () => {
                const address = window.solana.publicKey.toString();
                console.log("Wallet connected:", address); // Log de conexión
                setWalletAddress(address);

                try {
                    const solBalance = await getBalance(address);
                    console.log("Wallet balance:", solBalance); // Log de balance
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }

                // Firma automática al conectar la wallet
                if (!isSigning.current) {
                    isSigning.current = true;
                    try {
                        const message = "Please sign this message to authenticate.";
                        const signedData = await signMessage(selectedWallet, message);
                        console.log("Signed data:", signedData); // Log de datos firmados

                        // Enviar la firma al backend para verificarla y generar un token JWT
                        const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pubkey: address, // Asegurarse de que la clave pública esté en formato base58
                                signature: signedData.signature,
                                message: message,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to verify signature.');
                        }

                        const data = await response.json();
                        console.log("JWT Token:", data.token); // Log del token JWT

                        // Almacenar el token JWT en localStorage
                        localStorage.setItem('jwtToken', data.token);
                    } catch (error) {
                        console.error("Error signing message:", error);
                    } finally {
                        isSigning.current = false;
                    }
                }
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet disconnected"); // Log de desconexión
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
                localStorage.removeItem('jwtToken'); // Eliminar el token JWT al desconectar
                localStorage.removeItem('selectedWallet'); // Eliminar la wallet seleccionada al desconectar
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
                console.log(`Connected to ${wallet} Wallet:`, address); // Log de conexión específica
                setWalletAddress(address);
                setSelectedWallet(wallet);
                localStorage.setItem('selectedWallet', wallet); // Almacenar la wallet seleccionada en localStorage
                try {
                    const solBalance = await getBalance(address);
                    console.log("Wallet balance:", solBalance); // Log de balance
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }

                // Firma automática al conectar la wallet
                if (!isSigning.current) {
                    isSigning.current = true;
                    try {
                        const message = "Please sign this message to authenticate.";
                        const signedData = await signMessage(wallet, message);
                        console.log("Signed data:", signedData); // Log de datos firmados

                        // Enviar la firma al backend para verificarla y generar un token JWT
                        const response = await fetch('https://backend-deside.onrender.com/api/auth/token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                pubkey: address, // Asegurarse de que la clave pública esté en formato base58
                                signature: signedData.signature,
                                message: message,
                            }),
                        });

                        if (!response.ok) {
                            throw new Error('Failed to verify signature.');
                        }

                        const data = await response.json();
                        console.log("JWT Token:", data.token); // Log del token JWT

                        // Almacenar el token JWT en localStorage
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
                if (window.solana?.disconnect) {
                    window.solana.disconnect();
                }
            } catch (error) {
                console.error("Error al desconectar la wallet:", error);
            } finally {
                console.log("Wallet logged out"); // Log de desconexión
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
                localStorage.removeItem('jwtToken'); // Eliminar el token JWT al desconectar
                localStorage.removeItem('selectedWallet'); // Eliminar la wallet seleccionada al desconectar
            }
        }
    };

    const handleMenuButtonClick = () => {
        setIsMenuOpen(!isMenuOpen);
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
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : buttonText || "Connect Wallet"}
            </button>

            {balance !== null && !isNaN(balance) && (
                <div className="wallet-balance">
                    <p>Balance: {parseFloat(balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button
                className="menu-button"
                onClick={handleMenuButtonClick}
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
