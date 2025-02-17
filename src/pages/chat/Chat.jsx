import React, { useState, useEffect } from "react";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import WalletModal from "../../components/common/WalletModal.jsx"; 
import { getConnectedWallet } from "../../services/walletService.js";
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
        window.addEventListener("walletConnected", (e) => {
            setWalletAddress(e.detail.wallet);
            setIsModalOpen(false); 
        });

        return () => window.removeEventListener("walletConnected", updateWalletStatus);
    }, []);

    return (
        <div className="chat-page-container">
            <div className="left-panel">
                <ContactList onSelectContact={setSelectedContact} />
            </div>
            <div className="chat-window-panel">
                <ChatWindow selectedContact={selectedContact} />
            </div>
            <div className="right-panel">
                <RightPanel selectedContact={selectedContact} />
            </div>

            <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}

export default Chat;
