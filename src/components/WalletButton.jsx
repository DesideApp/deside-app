import React, { useState, useEffect } from "react";
import { connectWallet } from "../utils/solanaHelpers";
import WalletMenu from "./WalletMenu";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Escucha eventos de conexión y desconexión de Phantom Wallet
    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", () => {
                console.log("Wallet conectada:", window.solana.publicKey.toString());
                setWalletAddress(window.solana.publicKey.toString());
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet desconectada.");
                setWalletAddress(null);
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
                // Si ya está conectada, abre el menú lateral
                setIsMenuOpen(true);
            }
        } catch (error) {
            console.error("Error al conectar wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    function handleLogout() {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            if (window.solana?.disconnect) {
                window.solana.disconnect(); // Desconecta la wallet
            }
            setWalletAddress(null); // Limpia el estado de la wallet
            setIsMenuOpen(false); // Cierra el menú si está abierto
        }
    }

    return (
        <div>
            <button className="wallet-button" onClick={handleConnect}>
                {walletAddress
                    ? `${walletAddress.slice(0, 5)}...`
                    : "Connect Wallet"}
            </button>

            {/* Renderizar el menú lateral */}
            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)} // Cierra el menú al hacer clic en "X"
                walletAddress={walletAddress}
                handleLogout={handleLogout} // Manejar el logout
            />
        </div>
    );
}

export default WalletButton;

