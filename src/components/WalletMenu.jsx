import React, { useState, useEffect, useRef } from 'react';
import { getConnectedWallet, disconnectWallet } from '../services/walletService';
import WalletModal from './WalletModal';
import './WalletMenu.css';

function WalletMenu({ isOpen, onClose }) {
    const [walletAddress, setWalletAddress] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const updateConnectionStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            setWalletAddress(connectedWallet ? connectedWallet.walletAddress : null);
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
        disconnectWallet();
        setWalletAddress(null);
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('selectedWallet');
        onClose();
    };

    return (
        <>
            <div className={`wallet-menu ${isOpen ? 'open' : ''}`} ref={menuRef}>
                <div className="wallet-menu-header">
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="wallet-menu-content">
                    {walletAddress ? (
                        <>
                            <p className="wallet-address">{walletAddress}</p>
                            <button className="logout-button" onClick={handleLogoutClick}>Disconnect</button>
                        </>
                    ) : (
                        <button className="connect-button" onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                    )}
                </div>
            </div>

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={() => {}} />
        </>
    );
}

export default WalletMenu;
