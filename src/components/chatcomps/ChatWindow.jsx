import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";

function ChatWindow({ messages }) {
    const chatContainerRef = useRef(null);

    // Mantiene el scroll abajo cuando llegan mensajes nuevos
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="chat-window" ref={chatContainerRef}>
            {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender === "me" ? "sent" : "received"}`}>
                    {msg.text}
                </div>
            ))}
        </div>
    );
}

export default ChatWindow;
