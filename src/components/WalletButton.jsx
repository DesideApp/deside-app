import React, { useState, useEffect, useRef } from "react";
import { connectWallet, getBalance } from "../utils/solanaHelpers"; // Importamos también getBalance
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    // Maneja eventos de conexión/desconexión
    useEffect(() => {
        if (window.solana) {
            window.solana.on("connect", async () => {
                const address = window.solana.publicKey.toString();
                console.log("Wallet conectada:", address);
                setWalletAddress(address);

                // Obtener el balance al conectarse
                try {
                    const solBalance = await getBalance(address);
                    setBalance(solBalance);
                } catch (error) {
                    console.error("Error al obtener el balance:", error);
                }
            });

            window.solana.on("disconnect", () => {
                console.log("Wallet desconectada.");
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

    // Conecta a la wallet seleccionada
    async function handleConnect(wallet) {
        try {
            const address = await connectWallet(wallet);
            if (address) {
                setWalletAddress(address);
                
                // Obtener el balance de la wallet conectada
                const solBalance = await getBalance(address);
                setBalance(solBalance);
            }
        } catch (error) {
            console.error(`Error al conectar ${wallet} Wallet:`, error);
            alert(`Failed to connect ${wallet} Wallet. Please try again.`);
        } finally {
            setIsModalOpen(false); // Cierra el modal después de intentar conectar
        }
    }

    // Desconecta la wallet
    function handleLogout() {
        if (window.confirm("¿Seguro que quieres desconectarte?")) {
            console.log("Desconectando wallet...");
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
    }

    // Alterna el menú lateral
    function handleMenuButtonClick() {
        setIsMenuOpen(!isMenuOpen);
    }

    // Maneja el cierre del menú al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
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
            {/* Botón principal para conectar wallets */}
            <button className="wallet-button" onClick={() => setIsModalOpen(true)}>
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : "Connect Wallet"}
            </button>
    
            {/* Muestra el balance de SOL si está conectado */}
            {balance !== null && (
                <div className="wallet-balance">
                    <p>Balance: {balance.toFixed(2)} SOL</p>
                </div>
            )}
    
            {/* Botón para abrir el menú lateral */}
            <button
                className="menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
            >
                <span className="menu-icon"></span>
            </button>
    
            {/* Menú lateral */}
            <WalletMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                walletAddress={walletAddress}
                handleConnectModal={() => setIsModalOpen(true)}
                handleLogout={handleLogout}
                menuRef={menuRef}
            />
    
            {/* Modal para seleccionar wallets */}
            <WalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectWallet={handleConnect}
            />
        </div>
    );    
}

export default WalletButton;
