import React from "react";
import ChatWindow from "../../components/chatcomps/ChatWindow.jsx";
import RightPanel from "../../components/chatcomps/RightPanel.jsx";
import LeftPanel from "../../components/chatcomps/LeftPanel.jsx";
import { useAuthManager } from "../../services/authManager";
import { useLayout } from "../../contexts/LayoutContext";
import "./Chat.css";

function Chat() {
  const { ensureReady } = useAuthManager();
  const { leftbarExpanded } = useLayout();

  console.log("📌 ensureReady hook cargado.");

  const renderLeftPanel = () => (
    <div className="left-panel-container" onClick={() => ensureReady()}>
      <LeftPanel />
    </div>
  );

  const renderChatWindow = () => (
    <div className="chat-window-container" onClick={() => ensureReady()}>
      <ChatWindow />
    </div>
  );

  const renderRightPanel = () => (
    <div className="right-panel-container">
      <RightPanel />
    </div>
  );

  return (
    <div
      className="chat-page-container"
      style={{
        marginLeft: leftbarExpanded ? "200px" : "60px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div className="chat-layout">
        {renderLeftPanel()}
        {renderChatWindow()}
        {!leftbarExpanded && renderRightPanel()}
      </div>
    </div>
  );
}

export default Chat;
