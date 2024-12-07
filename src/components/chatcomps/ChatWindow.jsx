import React, { useState } from 'react';
import ChatInput from './ChatInput';
import "./ChatWindow.css";

function ChatWindow() {
    // Lista de mensajes y estado del modo concentración
    const [messages, setMessages] = useState([]);
    const [concentrationMode, setConcentrationMode] = useState(false);

    // Manejar el envío de nuevos mensajes
    const handleSendMessage = (newMessage) => {
        setMessages([...messages, { id: messages.length + 1, sender: "Yo", text: newMessage }]);
    };
    
    return (
        <div className={`chat-window-container ${concentrationMode ? 'concentration' : ''}`}>
            <div className="chat-header">
                <h3>Chat en Vivo</h3>
                <button 
                    onClick={() => setConcentrationMode(!concentrationMode)} 
                    className="concentration-toggle"
                >
                    {concentrationMode ? 'Desactivar Modo Concentración' : 'Activar Modo Concentración'}
                </button>
            </div>
            <div className="chat-messages">
                {messages.map((message) => (
                    <div key={message.id} className={`chat-message ${message.sender === "Yo" ? 'sent' : 'received'}`}>
                        <span className="message-sender">{message.sender}:</span>
                        <span className="message-text">{message.text}</span>
                    </div>
                ))}
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
}

export default ChatWindow;
