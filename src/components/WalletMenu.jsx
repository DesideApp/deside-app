import React, { useState, useEffect, useRef } from 'react';
import { getConnectedWallet, connectWallet, disconnectWallet } from '../services/walletService';
import './WalletMenu.css';

function WalletMenu({ isOpen, onClose, handleConnectModal, handleLogout }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const updateConnectionStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet) {
                setWalletAddress(connectedWallet.walletAddress);
            } else {
                setWalletAddress(null);
            }
        };

        updateConnectionStatus();

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

    const handleLogoutClick = () => {
        handleLogout();
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('selectedWallet');
    };

    return (
        <div className={`wallet-menu ${isOpen ? 'open' : ''}`} ref={menuRef}>
            <ul>
                <li onClick={handleConnectModal}>View Wallet</li>
                <li>Transactions</li>
                <li onClick={handleLogoutClick}>Disconnect</li>
            </ul>
        </div>
    );
}

export default WalletMenu;
