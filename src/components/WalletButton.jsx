import React, { useState, useEffect, useRef } from "react";
import { connectWallet, getBalance } from "../utils/solanaHelpers";
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
                setWalletAddress(address);

                try {
                    const solBalance = await getBalance(address);
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }
            });

            window.solana.on("disconnect", () => {
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
                setWalletAddress(address);
                try {
                    const solBalance = await getBalance(address);
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
                setWalletAddress(null);
                setBalance(null);
                setIsMenuOpen(false);
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
