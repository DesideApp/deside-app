import React from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import "./Chat.css";

function Chat() {
    return (
        <div className="chat-page-container">
            <div className="chat-layout">
                <ContactList />
                <ChatWindow />
                <RightPanel />
            </div>
        </div>
    );
}

export default Chat;
