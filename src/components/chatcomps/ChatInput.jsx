import React, { useState } from "react";
import "./ChatInput.css";

function ChatInput({ onSendMessage }) {
    const [message, setMessage] = useState("");

    const handleSendMessage = () => {
        if (message.trim() === "") return;
        onSendMessage(message);
        setMessage(""); // Limpiar input después de enviar
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <div className="chat-input">
            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
}

export default ChatInput;
