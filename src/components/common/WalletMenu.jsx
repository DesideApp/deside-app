import React, { useRef } from "react";
import { Copy } from "lucide-react";
import "./WalletMenu.css";

function WalletMenu({ isOpen, onClose, walletStatus, handleLogout, handleChangeWallet }) {
    const menuRef = useRef(null);

    // 🛠️ **Cerrar el menú si se hace clic fuera**
    React.useEffect(() => {
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
                    <div className="wallet-menu-content">
                        {walletStatus.walletAddress ? (
                            <>
                                <div className="wallet-address-container">
                                    <p className="wallet-address">{walletStatus.walletAddress}</p>
                                    <button className="copy-button" onClick={handleCopy} aria-label="Copy Address">
                                        <Copy size={18} />
                                    </button>
                                </div>
                                <button className="change-wallet-button" onClick={handleChangeWallet}>
                                    Change Wallet
                                </button>
                                <button className="logout-button" onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <button className="connect-button" onClick={handleChangeWallet}>
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default WalletMenu;
