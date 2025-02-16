import React, { useState, useEffect, useRef } from "react";
import WalletModal from "./WalletModal";
import { Copy } from "lucide-react"; 
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletStatus, handleLogout }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletStatus.walletAddress);
        console.info("✅ Dirección copiada.");
    };

    return (
        <>
            <div className={`wallet-menu ${isOpen ? "open" : ""}`} ref={menuRef}>
                <div className="wallet-menu-content">
                    {walletStatus.walletAddress ? (
                        <>
                            <div className="wallet-address-container">
                                <p className="wallet-address">{walletStatus.walletAddress}</p>
                                <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                                    <Copy size={18} />
                                </button>
                            </div>
                            <button className="logout-button" onClick={handleLogout}>Disconnect</button>
                        </>
                    ) : (
                        <button className="connect-button" onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                    )}
                </div>
            </div>

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

export default WalletMenu;
