import React from 'react';
import ContactList from '../../components/chatcomps/ContactList.jsx';
import ChatWindow from '../../components/chatcomps/ChatWindow.jsx';
import RightPanel from '../../components/chatcomps/RightPanel.jsx';
import useSignal from '../../hooks/useSignal';
import "./Chat.css";

function Chat() {
  const backendUrl = 'https://your-backend-url.com';
  const pubkey = 'your-public-key';

  const { connected, signals, sendSignal } = useSignal(backendUrl, pubkey);

  return (
    <div className="chat-page-container">
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
  );
}

export default Chat;
