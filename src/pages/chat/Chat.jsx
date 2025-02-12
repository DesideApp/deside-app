import React, { useState, useEffect } from "react";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import WalletModal from "../../components/WalletModal.jsx";
import { getConnectedWallet, connectWallet } from "../../services/walletService.js";
import "./Chat.css";

function Chat() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const updateWalletStatus = async () => {
            const connectedWallet = await getConnectedWallet();
            setWalletAddress(connectedWallet?.walletAddress || null);
        };

        updateWalletStatus();

        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, []);

    const handleWalletSelect = async (wallet) => {
        try {
            const address = await connectWallet(wallet);
            setWalletAddress(address);
            setIsModalOpen(false); // 🔵 Cierra el modal después de conectar
        } catch (error) {
            console.error("❌ Error connecting wallet:", error);
        }
    };

    return (
        <div className="chat-page-container">
            {!walletAddress && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>🔑 Connect your wallet to start chatting</p>
                        <button onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                    </div>
                </div>
            )}

            <div className="left-panel">
                <ContactList onSelectContact={setSelectedContact} />
            </div>
            <div className="chat-window-panel">
                <ChatWindow selectedContact={selectedContact} />
            </div>
            <div className="right-panel">
                <RightPanel selectedContact={selectedContact} />
            </div>

            {/* ✅ Ahora el modal de conexión pasa `handleWalletSelect` correctamente */}
            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectWallet={handleWalletSelect} />
        </div>
    );
}

export default Chat;
