import React, { useState, useEffect } from "react";
import { connectWallet } from "../utils/solanaHelpers";
import WalletMenu from "./WalletMenu";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
                const address = await connectWallet();
                setWalletAddress(address); // Almacena la dirección conectada
            } else {
                setIsMenuOpen(true); // Abre el menú si ya está conectado
            }
        } catch (error) {
            console.error("Error al conectar wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    function handleLogout() {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            setIsLoading(true);
            if (window.solana?.disconnect) {
                window.solana.disconnect();
            }
            setWalletAddress(null); // Limpia el estado de la wallet
            setIsMenuOpen(false); // Cierra el menú
            setIsLoading(false);
        }
    }

    return (
        <div>
            <button className="wallet-button" onClick={handleConnect} disabled={isLoading}>
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
