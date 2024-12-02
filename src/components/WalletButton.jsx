import React, { useState, useEffect } from "react";
import { connectWallet } from "../utils/solanaHelpers";
import WalletMenu from "./WalletMenu";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", () => {
                console.log("Wallet conectada:", window.solana.publicKey.toString());
                setWalletAddress(window.solana.publicKey.toString());
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet desconectada.");
                setWalletAddress(null); // Limpia el estado
                setIsMenuOpen(false); // Cierra el menú si está abierto
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
            if (!walletAddress) {
                // Intenta conectar la wallet usando el helper
                const address = await connectWallet();
                setWalletAddress(address); // Almacena la dirección conectada
            } else {
                alert("Wallet already connected!");
            }
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
                console.log("Estado limpio y menú cerrado.");
            }
        }
    }

    function handleMenuButtonClick() {
        if (!walletAddress) {
            alert("Please connect your wallet first.");
        } else {
            setIsMenuOpen(!isMenuOpen);
        }
    }

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
            >
                ⋮
            </button>

            {/* Renderizar el menú lateral */}
            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletAddress={walletAddress}
                handleLogout={handleLogout}
            />
        </div>
    );
}

export default WalletButton;