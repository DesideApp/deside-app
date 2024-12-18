import React, { useState, useEffect, useRef } from "react";
import { connectWallet, getBalance, signMessage } from "../utils/solanaHelpers.js";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

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
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet disconnected"); // Log de desconexión
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
            });
        }

        return () => {
            if (window.solana) {
                window.solana.removeAllListeners("connect");
                window.solana.removeAllListeners("disconnect");
            }
        };
    }, []);

    const handleConnect = async (wallet) => {
        try {
            const address = await connectWallet(wallet);
            if (address) {
                console.log(`Connected to ${wallet} Wallet:`, address); // Log de conexión específica
                setWalletAddress(address);
                try {
                    const solBalance = await getBalance(address);
                    console.log("Wallet balance:", solBalance); // Log de balance
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
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
            }
        }
    };

    const handleSignMessage = async (wallet) => {
        try {
            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            console.log("Signed data:", signedData); // Log de datos firmados

            // Aquí puedes enviar los datos firmados al backend para su verificación
            // const response = await apiRequest('/api/auth/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(signedData),
            // });

            // if (response.ok) {
            //     console.log("Authentication successful");
            // } else {
            //     console.error("Authentication failed");
            // }
        } catch (error) {
            console.error(`Error signing message with ${wallet} Wallet:`, error);
            alert(`Failed to sign message with ${wallet} Wallet. Please try again.`);
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
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : "Connect Wallet"}
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

            <button onClick={() => handleSignMessage("phantom")}>Sign Message</button>

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
