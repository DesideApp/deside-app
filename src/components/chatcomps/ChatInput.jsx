import React, { useState } from 'react';
import "./ChatInput.css";

function ChatInput({ onSendMessage }) {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSend = () => {
        if (inputValue.trim() !== "") {
            onSendMessage(inputValue);
            setInputValue("");
        }
    };

    return (
        <div className="chat-input-container">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje..."
                className="chat-input"
            />
            <button onClick={handleSend} className="send-button">
                Enviar
            </button>
        </div>
    );
}

export default ChatInput;
