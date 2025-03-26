import React, { useState } from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import LeftPanel from "../../components/chatcomps/LeftPanel.jsx";
import { useAuthManager } from "../../services/authManager"; // ✅ Importación correcta
import "./Chat.css";

function Chat() {
  const [selectedContact, setSelectedContact] = useState(null);
  const { ensureReady } = useAuthManager(); // ✅ Obtenemos la función desde el hook

  const handleSelectContact = (contact) => {
    ensureReady(() => setSelectedContact(contact));
  };

  const renderLeftPanel = () => (
    <div className="left-panel-container">
      <LeftPanel onSelectContact={handleSelectContact} />
    </div>
  );

  const renderChatWindow = () => (
    <div className="chat-window-container">
      <ChatWindow selectedContact={selectedContact} />
    </div>
  );

  return (
    <div className="chat-page-container">
      <div className="chat-layout">
        {renderLeftPanel()}
        {renderChatWindow()}
        <div className="right-panel-container">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default Chat;
