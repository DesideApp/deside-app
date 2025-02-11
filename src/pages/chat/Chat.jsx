import React, { useState, useEffect } from "react";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatComponent from "../../components/chatcomps/ChatComponent.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import { getConnectedWallet, connectWallet } from "../../services/walletService.js";
import "./Chat.css";

function Chat() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        const checkWallet = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet?.walletAddress) {
                setWalletAddress(connectedWallet.walletAddress);
            }
        };
        checkWallet();
    }, []);

    const handleConnectWallet = async () => {
        try {
            const address = await connectWallet("phantom");
            setWalletAddress(address);
        } catch (error) {
            console.error("❌ Error connecting wallet:", error);
        }
    };

    return (
        <div className="chat-page-container">
            {/* 🔵 Capa de transparencia si no hay wallet conectada */}
            {!walletAddress && (
                <div className="overlay">
                    <div className="overlay-content">
                        <p>🔑 Connect your wallet to start chatting</p>
                        <button onClick={handleConnectWallet}>Connect Wallet</button>
                    </div>
                </div>
            )}

            {/* 🔵 Paneles del chat */}
            <div className="left-panel">
                <ContactList onSelectContact={setSelectedContact} />
            </div>
            <div className="chat-window-panel">
                <ChatComponent selectedContact={selectedContact} />
            </div>
            <div className="right-panel">
                <RightPanel />
            </div>
        </div>
    );
}

export default Chat;
