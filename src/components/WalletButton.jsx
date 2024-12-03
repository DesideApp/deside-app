import React, { useState, useEffect, useRef } from "react";
import { connectWallet } from "../utils/solanaHelpers";
import WalletMenu from "./WalletMenu";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", () => {
                console.log("Wallet conectada:", window.solana.publicKey.toString());
                setWalletAddress(window.solana.publicKey.toString());
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet desconectada.");
                setWalletAddress(null);
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

    async function handleConnect() {
        try {
            const address = await connectWallet();
            setWalletAddress(address);
        } catch (error) {
            console.error("Error al conectar wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    function handleLogout() {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            console.log("Desconectando wallet...");
            try {
                if (window.solana?.disconnect) {
                    window.solana.disconnect();
                    console.log("Wallet desconectada.");
                }
            } catch (error) {
                console.error("Error al desconectar la wallet:", error);
            } finally {
                setWalletAddress(null);
                setIsMenuOpen(false);
            }
        }
    }

    function handleMenuButtonClick() {
        setIsMenuOpen(!isMenuOpen);
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false); // Cierra el menú si se hace clic fuera
            }
        }

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
            {/* Botón principal para conectar */}
            <button className="wallet-button" onClick={handleConnect}>
                {walletAddress
                    ? `${walletAddress.slice(0, 5)}...`
                    : "Connect Wallet"}
            </button>

            {/* Botón para abrir el menú */}
            <button
                className="menu-button"
                onClick={handleMenuButtonClick}
                aria-label="Menu"
            >
                <span className="menu-icon"></span>
            </button>

            {/* Renderizar el menú lateral */}
            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletAddress={walletAddress}
                handleConnect={handleConnect} // Pasamos la función de conexión
                handleLogout={handleLogout}
                menuRef={menuRef} // Pasamos la referencia del menú
            />
        </div>
    );
}

export default WalletButton;
