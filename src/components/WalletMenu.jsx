import React, { useState, useEffect, useRef } from 'react';
import { getConnectedWallet, disconnectWallet, connectWallet } from '../services/walletService';
import WalletModal from './WalletModal';
import './WalletMenu.css';

function WalletMenu({ isOpen, onClose, walletAddress, handleLogout }) {
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

    return (
        <>
            <div className={`wallet-menu ${isOpen ? 'open' : ''}`} ref={menuRef}>
                <div className="wallet-menu-content">
                    {walletAddress ? (
                        <>
                            <p className="wallet-address">{walletAddress}</p>
                            <button className="logout-button" onClick={handleLogout}>Disconnect</button>
                        </>
                    ) : (
                        <button className="connect-button" onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                    )}
                </div>
            </div>

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={connectWallet} />
        </>
    );
}

export default WalletMenu;
