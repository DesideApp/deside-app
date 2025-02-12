import React, { useState, useEffect } from "react";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import WalletModal from "../../components/WalletModal.jsx"; // ✅ Importamos el modal global
import { getConnectedWallet } from "../../services/walletService.js";
import "./Chat.css";

function Chat() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Estado para el modal

    useEffect(() => {
        const checkWallet = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet?.walletAddress) {
                setWalletAddress(connectedWallet.walletAddress);
            }
        };
        checkWallet();
    }, []);

    return (
        <div className="chat-page-container">
            {/* 🔵 Overlay que abre el mismo WalletModal */}
            {!walletAddress && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>🔑 Connect your wallet to start chatting</p>
                        <button onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
                    </div>
                </div>
            )}

            {/* 🔵 Paneles del chat */}
            <div className="left-panel">
                <ContactList onSelectContact={setSelectedContact} />
            </div>
            <div className="chat-window-panel">
                <ChatWindow selectedContact={selectedContact} />
            </div>
            <div className="right-panel">
                <RightPanel selectedContact={selectedContact} />
            </div>

            {/* 🔵 Modal de conexión de wallet compartido */}
            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default Chat;
