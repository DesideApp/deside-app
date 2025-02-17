import React, { useState, useEffect, useRef } from "react";
import WalletModal from "./WalletModal";
import { Copy } from "lucide-react"; 
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletStatus, handleLogout }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    // 🛠️ **Cerrar el menú si se hace clic fuera**
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // 🛠️ **Copiar dirección de la wallet**
    const handleCopy = () => {
        if (walletStatus.walletAddress) {
            navigator.clipboard.writeText(walletStatus.walletAddress);
            alert("✅ Dirección copiada al portapapeles.");
        }
    };

    return (
        <>
            {isOpen && (
                <div className="wallet-menu open" ref={menuRef}>
                    <div className="wallet-menu-header">
                        <h3>Wallet Menu</h3>
                        <button className="close-button" onClick={onClose}>✖</button>
                    </div>
                    <div className="wallet-menu-content">
                        {walletStatus.walletAddress ? (
                            <>
                                <div className="wallet-address-container">
                                    <p className="wallet-address">{walletStatus.walletAddress}</p>
                                    <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <button className="change-wallet-button" onClick={() => setIsModalOpen(true)}>Change Wallet</button>
                                <button className="logout-button" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <button className="connect-button" onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                        )}
                    </div>
                </div>
            )}

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

export default WalletMenu;
