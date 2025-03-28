import React from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import LeftPanel from "../../components/chatcomps/LeftPanel.jsx";
import { useAuthManager } from "../../services/authManager";
import "./Chat.css";

function Chat() {
  const { ensureReady } = useAuthManager();
  console.log("📌 ensureReady hook cargado.");

  const handleClick = () => {
    ensureReady(); // sin acción, solo trigger
  };

  return (
    <div className="chat-page-container" onClick={handleClick}>
      <div className="chat-layout">
        <div className="left-panel-container">
          <LeftPanel />
        </div>
        <div className="chat-window-container">
          <ChatWindow />
        </div>
        <div className="right-panel-container">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default Chat;
