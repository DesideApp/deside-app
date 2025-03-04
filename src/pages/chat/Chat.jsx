import React from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import ContactList from "../../components/chatcomps/ContactList.jsx";
import "./Chat.css"; // Asegurar que el CSS se importe correctamente

function Chat() {
    return (
        <div className="chat-container">
            <ContactList />
            <ChatWindow />
            <RightPanel />
        </div>
    );
}

export default Chat;
