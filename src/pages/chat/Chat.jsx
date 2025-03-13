import React, { useState } from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import LeftPanel from "../../components/chatcomps/LeftPanel.jsx";
import "./Chat.css";

function Chat() {
    const [selectedContact, setSelectedContact] = useState(null);

    return (
        <div className="chat-page-container">
            <div className="chat-layout">
                <div className="left-panel-container">
                    <LeftPanel onSelectContact={setSelectedContact} /> {/* ✅ Pasamos `onSelectContact` */}
                </div>
                <div className="chat-window-container">
                    <ChatWindow selectedContact={selectedContact} /> {/* ✅ `ChatWindow` recibe `selectedContact` */}
                </div>
                <div className="right-panel-container">
                    <RightPanel />
                </div>
            </div>
        </div>
    );
}

export default Chat;