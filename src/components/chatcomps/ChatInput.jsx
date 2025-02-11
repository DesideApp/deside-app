import React, { useState, useRef } from "react";
import "./ChatInput.css";

function ChatInput({ onSendMessage }) {
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);

    const handleSendMessage = () => {
        if (message.trim() === "") return;
        onSendMessage(message);
        setMessage(""); // Limpiar input después de enviar
        inputRef.current.focus(); // Mantener el focus en el input
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-input-container">
            <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className="send-button" onClick={handleSendMessage} aria-label="Send Message">
                Send
            </button>
        </div>
    );
}

export default ChatInput;
