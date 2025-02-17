import React, { useState } from "react";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import WalletModal from "../../components/common/WalletModal.jsx"; 
import "./Chat.css";

function Chat() {
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
