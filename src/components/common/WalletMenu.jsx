import React, { useRef, useEffect } from "react";
import { Copy } from "lucide-react";
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletStatus, handleLogout }) {
    const menuRef = useRef(null);

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

    const handleCopy = () => {
        if (walletStatus?.walletAddress) {
            navigator.clipboard.writeText(walletStatus.walletAddress);
            alert("✅ Dirección copiada al portapapeles.");
        }
    };

    return (
        <>
            {isOpen && (
                <div className="wallet-menu open" ref={menuRef}>
                    <div className="wallet-menu-content">
                        {walletStatus?.walletAddress ? (
                            <>
                                <div className="wallet-header">
                                    <p className="wallet-network">🔗 Solana</p>
                                    <p className="wallet-balance">
                                        {walletStatus.balance ? `${walletStatus.balance.toFixed(2)} SOL` : "-- SOL"}
                                    </p>
                                </div>

                                <div className="wallet-address-container">
                                    <p className="wallet-address">{walletStatus.walletAddress}</p>
                                    <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                                        <Copy size={18} />
                                    </button>
                                </div>

                                <button className="logout-button" onClick={handleLogout}>Disconnect</button>
                            </>
                        ) : (
                            <div className="wallet-disconnected">
                                <p className="no-wallet">⚠️ No wallet connected.</p>
                                <button className="connect-button" onClick={onClose}>Connect Wallet</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default WalletMenu;
