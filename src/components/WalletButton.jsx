import React, { useState, useEffect, useRef } from "react";
import { connectWallet, signMessage, getConnectedWallet, disconnectWallet, getWalletBalance } from "../services/walletService";
import { authenticateWithServer } from "../services/authservices";
import WalletMenu from "./WalletMenu";
import WalletModal from "./WalletModal";
import "./WalletButton.css";

function WalletButton({ buttonText }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
                setBalance(await getWalletBalance(connectedWallet.walletAddress));
            }
        };
        updateWalletStatus();
    }, []);

    const handleConnect = async (wallet) => {
        try {
            const address = await connectWallet(wallet);
            setWalletAddress(address);
            localStorage.setItem('selectedWallet', wallet);

            setBalance(await getWalletBalance(address));

            const message = "Please sign this message to authenticate.";
            const signedData = await signMessage(wallet, message);
            await authenticateWithServer(address, signedData.signature, message);
        } catch (error) {
            console.error("Error connecting wallet:", error);
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleLogout = () => {
        if (!window.confirm("¿Seguro que quieres desconectarte?")) return;

        disconnectWallet();
        setWalletAddress(null);
        setBalance(null);
        setIsMenuOpen(false);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('selectedWallet');
    };

    const handleToggleMenu = () => setIsMenuOpen(prevState => !prevState);

    return (
        <div className="wallet-container">
            <button className="wallet-button" onClick={() => setIsModalOpen(true)}>
                {walletAddress ? `${walletAddress.slice(0, 5)}...` : buttonText || "Connect Wallet"}
            </button>

            {balance !== null && !isNaN(balance) && (
                <div className="wallet-balance">
                    <p>Balance: {parseFloat(balance).toFixed(2)} SOL</p>
                </div>
            )}

            <button className="menu-button" onClick={handleToggleMenu} aria-label="Menu">
                <span className="menu-icon"></span>
            </button>

            <WalletMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} handleLogout={handleLogout} />

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={handleConnect} />
        </div>
    );
}

export default WalletButton;
