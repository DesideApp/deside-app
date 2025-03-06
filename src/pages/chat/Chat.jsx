import React from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import "./Chat.css";

function Chat() {
    return (
        <div className="chat-page-container">
            <div className="chat-layout">
                <div className="left-panel">
                    <ContactList />
                </div>
                <div className="chat-window-panel">
                    <ChatWindow />
                </div>
                <div className="right-panel">
                    <RightPanel />
                </div>
            </div>
        </div>
    );
}

export default Chat;
